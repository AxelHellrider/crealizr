import type { MonsterBase, MonsterAction } from "@/app/types/monster";
import { CR_MATRIX, ABILITY_SCORE_MODIFIERS } from "@/app/data/constants";
import { CR_MATRIX_2024, ABILITY_SCORE_MODIFIERS_2024 } from "@/app/data/constants2024";
import type { Edition } from "@/app/types/monster";
import { clamp } from "@/app/lib/number";

function abilityModifier(score: number) {
    return Math.floor((score - 10) / 2);
}

function findCRRow(matrix: typeof CR_MATRIX, cr: number) {
    for (let i = matrix.length - 1; i >= 0; i--) {
        if (matrix[i].cr <= cr) return matrix[i];
    }
    return matrix[0];
}

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

function scaleAbilityScore(base: number, crDiff: number, modifiers: Record<string, readonly number[]>) {
    const mod = abilityModifier(base);
    const modIncrease = Math.floor(crDiff / 2);
    const newMod = clamp(mod + modIncrease, -5, 10);
    const key = newMod >= 0 ? `+${newMod}` : `${newMod}`;
    const possibleScores = modifiers[key];
    if (!possibleScores || possibleScores.length === 0) return base;
    return possibleScores.reduce((a, b) => Math.abs(a - base) <= Math.abs(b - base) ? a : b);
}

function scaleMonster(
    monster: MonsterBase,
    targetCR: number,
    edition: Edition,
    options?: {
        acEquipment?: number;
        acRace?: number;
        abilityScoreBonus?: Partial<Record<keyof MonsterBase["stats"], number>>;
    }
): MonsterBase {
    const matrix = edition === "2024" ? CR_MATRIX_2024 : CR_MATRIX;
    const modifiers = edition === "2024" ? ABILITY_SCORE_MODIFIERS_2024 : ABILITY_SCORE_MODIFIERS;

    const srcCR = monster.cr ?? 0.125;
    if (srcCR === targetCR) return { ...monster };

    const srcRow = findCRRow(matrix, srcCR);
    const tgtRow = findCRRow(matrix, targetCR);

    const hasActions = (monster.actions?.length ?? 0) > 0;
    const srcDPR = hasActions ? estimateDPR(monster) : null;
    const tgtDPR = tgtRow.dpr;

    const finalDPR = {
        min: Math.max(1, Math.round(tgtDPR * 0.75)),
        max: Math.max(1, Math.round(tgtDPR * 1.25)),
        range: `${Math.max(1, Math.round(tgtDPR * 0.75))}–${Math.max(1, Math.round(tgtDPR * 1.25))}`
    };

    // Scale HP proportionally: preserve how far above/below this monster sits relative
    // to its own CR's baseline, then apply that ratio at the target CR.
    const hpScale = tgtRow.hp / Math.max(1, srcRow.hp);
    const finalHp = Math.max(1, Math.round(monster.stats.hp * hpScale));

    // dprScale is only meaningful when actions were provided; otherwise tgtDPR is shown directly.
    const dprScale = srcDPR !== null ? tgtDPR / Math.max(1, srcDPR) : null;

    const acDiff = tgtRow.ac - monster.stats.ac;
    let finalAC = clamp(monster.stats.ac + Math.sign(acDiff) * Math.min(2, Math.abs(acDiff)), 5, 30);

    if (options?.acEquipment) finalAC += options.acEquipment;
    if (options?.acRace) finalAC += options.acRace;

    const newStats: MonsterBase["stats"] = { ...monster.stats, hp: finalHp, ac: finalAC };
    const crDiff = targetCR - srcCR;
    const abilityScores: (keyof Pick<MonsterBase["stats"], "str"|"dex"|"con"|"int"|"wis"|"cha">)[] = ["str","dex","con","int","wis","cha"];

    for (const ab of abilityScores) {
        let base: number = monster.stats[ab] as number;
        base = scaleAbilityScore(base, crDiff, modifiers as unknown as Record<string, readonly number[]>);
        const bonus = options?.abilityScoreBonus?.[ab] ?? 0;
        base += bonus;
        newStats[ab] = clamp(base, 1, 30) as number;
    }

    const atkAbilityMod = Math.max(abilityModifier(newStats.str), abilityModifier(newStats.dex));
    const srcAtkMod = Math.max(abilityModifier(monster.stats.str), abilityModifier(monster.stats.dex));
    const attackDelta = Number(tgtRow.atkb) - Number(srcRow.atkb);
    const finalAttackBonus = Math.round(Number(srcRow.atkb) + attackDelta + atkAbilityMod - srcAtkMod);

    const finalSaveDC = tgtRow.save_dc + (abilityModifier(newStats.int) - abilityModifier(monster.stats.int));

    const scaled: MonsterBase & { _advice?: Record<string, number | unknown> } = {
        ...monster,
        cr: targetCR,
        edition,
        stats: newStats,
        dpr: finalDPR,
        raw_source_ref: `${monster.raw_source_ref ?? ""} — scaled (${edition})`,
        _advice: {
            suggestedAttackBonus: finalAttackBonus,
            suggestedSaveDC: finalSaveDC,
            srcDPR,
            tgtDPR,
            hpScale,
            ...(dprScale !== null
                ? { dprScale }
                : { dprNote: "no actions provided — tgtDPR shows target CR expected DPR directly" }),
            usedRow: tgtRow,
        },
    };

    return scaled;
}

export function scaleMonster2014(
    monster: MonsterBase,
    targetCR: number,
    options?: {
        acEquipment?: number;
        acRace?: number;
        abilityScoreBonus?: Partial<Record<keyof MonsterBase["stats"], number>>;
    }
): MonsterBase {
    return scaleMonster(monster, targetCR, "2014", options);
}

export function scaleMonster2024(
    monster: MonsterBase,
    targetCR: number,
    options?: {
        acEquipment?: number;
        acRace?: number;
        abilityScoreBonus?: Partial<Record<keyof MonsterBase["stats"], number>>;
    }
): MonsterBase {
    return scaleMonster(monster, targetCR, "2024", options);
}
