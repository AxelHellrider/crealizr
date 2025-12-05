import type { MonsterBase, MonsterAction } from "@/app/types/monsters_schema";
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

function scaleAbilityScore(base: number, crDiff: number) {
    const mod = abilityModifier(base);
    const modIncrease = Math.floor(crDiff / 2);
    const newMod = clamp(mod + modIncrease, -5, 10);
    const key = (newMod >= 0 ? `+${newMod}` : `${newMod}`) as keyof typeof ABILITY_SCORE_MODIFIERS;
    const possibleScores = ABILITY_SCORE_MODIFIERS[key];
    if (!possibleScores || possibleScores.length === 0) return base;
    return possibleScores.reduce((a, b) => Math.abs(a - base) <= Math.abs(b - base) ? a : b);
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

    if (options?.acEquipment) finalAC += options.acEquipment;
    if (options?.acRace) finalAC += options.acRace;

    // Ability scores scaling
    const newStats: MonsterBase["stats"] = { ...monster.stats, hp: finalHp, ac: finalAC };
    const crDiff = targetCR - srcCR;
    const numericAbilities: (keyof Omit<MonsterBase["stats"], "speed">)[] = ["ac","hp","str","dex","con","int","wis","cha"];

    for (const ab of numericAbilities) {
        let base: number = monster.stats[ab] as number; // guaranteed number
        base = scaleAbilityScore(base, crDiff);

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
        challenge_rating: targetCR,
        stats: newStats,
        raw_source_ref: `${monster.raw_source_ref ?? ""} — scaled (2014)`,
        _advice: {
            suggestedAttackBonus: finalAttackBonus,
            suggestedSaveDC: finalSaveDC,
            srcDPR,
            tgtDPR,
            hpScale,
            dprScale,
            usedRow: tgtRow,
        },
    };

    return scaled;
}
