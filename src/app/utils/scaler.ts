import type { MonsterBase, MonsterAction } from "@/app/types/monster";
import { CR_MATRIX, ABILITY_SCORE_MODIFIERS } from "@/app/data/constants";
import { clamp } from "@/app/lib/number";

function abilityModifier(score: number) {
    return Math.floor((score - 10) / 2);
}

/** Finds the highest CR_MATRIX row whose `cr` does not exceed the given CR (rows are sparse, not one-per-CR). */
function findCRRow(matrix: typeof CR_MATRIX, cr: number) {
    for (let i = matrix.length - 1; i >= 0; i--) {
        if (matrix[i].cr <= cr) return matrix[i];
    }
    return matrix[0];
}

/**
 * Estimates average damage-per-round from a monster's action damage strings
 * (e.g. "2d6+3"). Falls back to 1 when there are no actions, since a DPR of 0
 * would divide-by-zero downstream in `scaleMonster`'s dprScale ratio.
 */
function estimateDPR(monster: MonsterBase) {
    if (!monster.actions || monster.actions.length === 0) return 1;
    let total = 0;
    for (const a of monster.actions as MonsterAction[]) {
        const dmg = a.damage ?? "";
        const diceMatch = String(dmg).match(/(\d+)d(\d+)/g);
        let avg = 0;
        if (diceMatch) {
            for (const dice of diceMatch) {
                const [countStr, sidesStr] = dice.split("d");
                avg += Number(countStr) * (Number(sidesStr) + 1) / 2;
            }
            const plusMatch = String(dmg).match(/([+-]\s*\d+)/);
            if (plusMatch) avg += Number(plusMatch[1].replace(/\s+/g, ""));
        } else {
            const num = Number(String(dmg).replace(/[^\d-]/g, ""));
            if (!isNaN(num) && num > 0) avg = num;
        }
        total += avg;
    }
    return Math.max(1, Math.round(total));
}

/**
 * Maps an ability score to its nearest equivalent at a new CR by shifting the
 * ability modifier by half the CR delta, then snapping to the closest score
 * that actually produces that modifier in the modifier table.
 */
function scaleAbilityScore(base: number, crDiff: number, modifiers: Record<string, readonly number[]>) {
    const mod = abilityModifier(base);
    const modIncrease = Math.floor(crDiff / 2);
    const newMod = clamp(mod + modIncrease, -5, 10);
    const key = newMod >= 0 ? `+${newMod}` : `${newMod}`;
    const possibleScores = modifiers[key];
    if (!possibleScores || possibleScores.length === 0) return base;
    return possibleScores.reduce((a, b) => Math.abs(a - base) <= Math.abs(b - base) ? a : b);
}

/** How a monster's Armor Class is derived, before shield/cover situational bonuses. */
export type ACSource = "dex" | "armor" | "natural";

const MONSTER_AC_CAP = 30;

/**
 * Computes final AC from an AC source (Dex-based, equipped armor, or natural
 * armor) plus an optional shield. Dex-based and natural-armor AC are inherent
 * to the creature and capped at 30; equipped armor and a held shield are
 * treated as items and are allowed to push AC past the cap, mirroring how
 * player-character AC caps at 20 unless gear pushes it higher.
 */
function computeAC(
    source: ACSource,
    dexMod: number,
    armorBonus: number,
    naturalArmor: number,
    hasShield: boolean,
): number {
    const inherent = source === "natural" ? naturalArmor : 10 + dexMod;
    const cappedInherent = source === "armor" ? 0 : clamp(inherent, 1, MONSTER_AC_CAP);
    const armorContribution = source === "armor" ? 10 + armorBonus : 0;
    const shieldContribution = hasShield ? 2 : 0;
    return cappedInherent + armorContribution + shieldContribution;
}

export type ScaleOptions = {
    acSource?: ACSource;
    armorBonus?: number;
    naturalArmor?: number;
    hasShield?: boolean;
    abilityScoreBonus?: Partial<Record<keyof MonsterBase["stats"], number>>;
};

/**
 * Rescales a monster's stat block from its current CR to `targetCR`, using
 * the CR matrix as the target baseline (HP, attack bonus, save DC, DPR) and
 * preserving the monster's original CR-relative deviation from that baseline
 * rather than overwriting it outright. AC is derived independently from the
 * chosen AC source (see `computeAC`), not from the matrix. `_advice` on the
 * result surfaces the intermediate figures (suggested attack bonus/DC, DPR
 * ratios) so the caller can show the DM what changed and why.
 */
export function scaleMonster(
    monster: MonsterBase,
    targetCR: number,
    options?: ScaleOptions,
): MonsterBase {
    const matrix = CR_MATRIX;
    const modifiers = ABILITY_SCORE_MODIFIERS;

    const srcCR = monster.cr ?? 0.125;
    if (srcCR === targetCR) return { ...monster };

    const srcRow = findCRRow(matrix, srcCR);
    const tgtRow = findCRRow(matrix, targetCR);

    const hasActions = (monster.actions?.length ?? 0) > 0;
    const srcDPR = hasActions ? estimateDPR(monster) : null;
    const tgtDPRMid = Math.round((tgtRow.dpr.min + tgtRow.dpr.max) / 2);

    const finalDPR = {
        min: tgtRow.dpr.min,
        max: tgtRow.dpr.max,
        range: `${tgtRow.dpr.min}–${tgtRow.dpr.max}`,
    };

    // Scale HP proportionally: preserve how far above/below this monster sits relative
    // to its own CR's baseline, then apply that ratio at the target CR.
    const hpScale = tgtRow.hp / Math.max(1, srcRow.hp);
    const finalHp = Math.max(1, Math.round(monster.stats.hp * hpScale));

    // dprScale is only meaningful when actions were provided; otherwise tgtDPR is shown directly.
    const dprScale = srcDPR !== null ? tgtDPRMid / Math.max(1, srcDPR) : null;

    const crDiff = targetCR - srcCR;
    const abilityScores: (keyof Pick<MonsterBase["stats"], "str"|"dex"|"con"|"int"|"wis"|"cha">)[] = ["str","dex","con","int","wis","cha"];

    const newStats: MonsterBase["stats"] = { ...monster.stats, hp: finalHp };

    for (const ab of abilityScores) {
        let base: number = monster.stats[ab] as number;
        base = scaleAbilityScore(base, crDiff, modifiers as unknown as Record<string, readonly number[]>);
        const bonus = options?.abilityScoreBonus?.[ab] ?? 0;
        base += bonus;
        newStats[ab] = clamp(base, 1, 30) as number;
    }

    const acSource = options?.acSource ?? "dex";
    newStats.ac = computeAC(
        acSource,
        abilityModifier(newStats.dex),
        options?.armorBonus ?? 0,
        options?.naturalArmor ?? monster.stats.ac,
        options?.hasShield ?? false,
    );

    const atkAbilityMod = Math.max(abilityModifier(newStats.str), abilityModifier(newStats.dex));
    const srcAtkMod = Math.max(abilityModifier(monster.stats.str), abilityModifier(monster.stats.dex));
    const attackDelta = Number(tgtRow.atkb) - Number(srcRow.atkb);
    const finalAttackBonus = Math.round(Number(srcRow.atkb) + attackDelta + atkAbilityMod - srcAtkMod);

    const finalSaveDC = tgtRow.save_dc + (abilityModifier(newStats.int) - abilityModifier(monster.stats.int));

    const scaled: MonsterBase & { _advice?: Record<string, number | unknown> } = {
        ...monster,
        cr: targetCR,
        stats: newStats,
        dpr: finalDPR,
        raw_source_ref: `${monster.raw_source_ref ?? ""} — scaled`,
        _advice: {
            suggestedAttackBonus: finalAttackBonus,
            suggestedSaveDC: finalSaveDC,
            srcDPR,
            tgtDPR: tgtDPRMid,
            hpScale,
            ...(dprScale !== null
                ? { dprScale }
                : { dprNote: "no actions provided — tgtDPR shows target CR expected DPR directly" }),
            usedRow: tgtRow,
        },
    };

    return scaled;
}
