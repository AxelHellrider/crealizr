import type { MonsterBase } from "@/app/types/monsters_schema";
import { CR_MATRIX, ABILITY_SCORE_MODIFIERS } from "@/app/data/constants";

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function abilityModifier(score: number) {
    return Math.floor((score - 10) / 2);
}

function findCRRow(cr: number) {
    for (let i = CR_MATRIX.length - 1; i >= 0; i--) {
        if (CR_MATRIX[i].cr <= cr) return CR_MATRIX[i];
    }
    return CR_MATRIX[0];
}

function estimateDPR(m: MonsterBase) {
    if (!m.actions || m.actions.length === 0) return 1;
    let total = 0;
    for (const a of m.actions) {
        const dmg = (a as any).damage ?? "";
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

function scaleAbilityScore(base: number, crDiff: number): number {
    let mod = Math.floor((base - 10) / 2);
    const modIncrease = Math.floor(crDiff / 2);
    const newMod = clamp(mod + modIncrease, -5, 10);
    const possibleScores = ABILITY_SCORE_MODIFIERS[newMod >= 0 ? `+${newMod}` : `${newMod}`];
    if (!possibleScores || possibleScores.length === 0) return base;
    return possibleScores.reduce((a, b) => Math.abs(a - base) <= Math.abs(b - base) ? a : b);
}

export function scaleMonster2014(
    monster: MonsterBase,
    targetCR: number,
    options?: {
        acEquipment?: number,
        acRace?: number,
        abilityScoreBonus?: Partial<Record<keyof MonsterBase["stats"], number>>
    }
): MonsterBase {
    const srcCR = monster.challenge_rating ?? 0.125;
    if (srcCR === targetCR) return { ...monster };

    const srcRow = findCRRow(srcCR);
    const tgtRow = findCRRow(targetCR);

    const srcDPR = estimateDPR(monster);
    const tgtDPR = tgtRow.dpr;

    // HP scaling
    const hpScale = tgtRow.hp / Math.max(1, monster.stats.hp);
    const finalHp = Math.max(1, Math.round(monster.stats.hp * hpScale));

    // DPR scale (used for reference)
    const dprScale = tgtDPR / Math.max(1, srcDPR);

    // AC scaling
    const acDiff = tgtRow.ac - monster.stats.ac;
    let finalAC = clamp(monster.stats.ac + Math.sign(acDiff) * Math.min(2, Math.abs(acDiff)), 5, 30);

    // Apply optional AC from equipment or race
    if (options?.acEquipment) finalAC += options.acEquipment;
    if (options?.acRace) finalAC += options.acRace;

    // Ability scores scaling
    const abilities: (keyof MonsterBase["stats"])[] = ["str", "dex", "con", "int", "wis", "cha"];
    const newStats: MonsterBase["stats"] = { ...monster.stats, hp: finalHp, ac: finalAC };
    const crDiff = targetCR - srcCR;

    for (const ab of abilities) {
        let base = monster.stats[ab] ?? 10;
        base = scaleAbilityScore(base, crDiff);

        // Apply optional ability score bonuses from race/features/class
        if (options?.abilityScoreBonus?.[ab]) {
            base += options.abilityScoreBonus[ab]!;
        }

        newStats[ab] = clamp(base, 1, 30);
    }

    // Suggested attack bonus
    const atkAbilityMod = Math.max(abilityModifier(newStats.str), abilityModifier(newStats.dex));
    const srcAtkMod = Math.max(abilityModifier(monster.stats.str), abilityModifier(monster.stats.dex));
    const attackDelta = Number(tgtRow.atkb) - Number(srcRow.atkb);
    const finalAttackBonus = Math.round(Number(srcRow.atkb) + attackDelta + atkAbilityMod - srcAtkMod);

    // Suggested save DC
    const finalSaveDC = tgtRow.save_dc + (abilityModifier(newStats.int) - abilityModifier(monster.stats.int));

    const scaled: MonsterBase = {
        ...monster,
        challenge_rating: targetCR,
        stats: newStats,
        raw_source_ref: `${monster.raw_source_ref ?? ""} — scaled (2014)`,
    };

    (scaled as any)._advice = {
        suggestedAttackBonus: finalAttackBonus,
        suggestedSaveDC: finalSaveDC,
        srcDPR,
        tgtDPR,
        hpScale,
        dprScale,
        usedRow: tgtRow,
    };

    return scaled;
}
