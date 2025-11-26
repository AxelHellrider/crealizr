import type { MonsterBase } from "@/app/types/monsters_schema";
import rawTable from "../data/utils/2014_CR.json";
import type { DMG2014Row } from "@/app/types/scaler2014";

/* ---------------------------
   Normalize the imported JSON (object) into a sorted array of rows
   --------------------------- */
const DMG_2014_ROWS: DMG2014Row[] = Object.values(rawTable)
    .map((r) => {
        const row = r as unknown as DMG2014Row;
        return { ...row, cr: Number(row.cr) } as DMG2014Row;
    })
    .sort((a, b) => a.cr - b.cr);

/* ---------------------------
   Basic helpers
   --------------------------- */
function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function findRowForCR(cr: number): DMG2014Row | null {
    const exact = DMG_2014_ROWS.find((r) => r.cr === cr);
    if (exact) return exact;

    for (let i = DMG_2014_ROWS.length - 1; i >= 0; i--) {
        const row = DMG_2014_ROWS[i];
        if (row.cr <= cr) return row;
    }

    return DMG_2014_ROWS[0] ?? null;
}

function abilityModifier(score: number) {
    return Math.floor((score - 10) / 2);
}

/* ---------------------------
   Exported helper (Helper 1)
   --------------------------- */
export function getExpectedForCR(cr: number): DMG2014Row | null {
    return findRowForCR(cr);
}

/* ---------------------------
   Core scaler (keeps your logic)
   --------------------------- */
export type ScaleOptions = {
    hpWeight?: number;
    dmgWeight?: number;
    softClamp?: boolean;
};

export function scaleMonster2014(
    monster: MonsterBase,
    targetCR: number,
    options?: ScaleOptions
): MonsterBase {
    const opts = {
        hpWeight: 0.7,
        dmgWeight: 0.8,
        softClamp: true,
        ...options,
    };

    const srcCR = monster.challenge_rating || 0.125;
    if (srcCR === targetCR) return { ...monster };

    const srcRow = getExpectedForCR(srcCR) ?? DMG_2014_ROWS[0];
    const tgtRow = getExpectedForCR(targetCR) ?? DMG_2014_ROWS[DMG_2014_ROWS.length - 1];

    const hpScale = tgtRow.hpMax / Math.max(1, srcRow.hpMax);

    function estimateDPR(m: MonsterBase) {
        let total = 0;
        if (!m.actions || m.actions.length === 0) return 1;
        for (const a of m.actions) {
            const dmg = (a as any).damage ?? "";
            const diceMatch = String(dmg).match(/(\d+)d(\d+)/g);
            let avg = 0;
            if (diceMatch) {
                for (const dice of diceMatch) {
                    const [countStr, sidesStr] = dice.split("d");
                    const count = Number(countStr);
                    const sides = Number(sidesStr);
                    avg += count * (1 + sides) / 2;
                }
                const plusMatch = String(dmg).match(/([+-]\s*\d+)/);
                if (plusMatch) {
                    avg += Number(plusMatch[1].replace(/\s+/g, ""));
                }
            } else {
                const num = Number(String(dmg).replace(/[^\d-]/g, ""));
                if (!Number.isNaN(num) && num > 0) avg = num;
            }
            total += avg;
        }
        return Math.max(1, Math.round(total));
    }

    const srcDPR = estimateDPR(monster);
    const tgtDPRMid = (tgtRow.dprMin + tgtRow.dprMax) / 2 || Math.max(1, srcDPR);
    const dprScale = tgtDPRMid / Math.max(1, srcDPR);

    const finalHpMultiplier = (1 - opts.hpWeight) + hpScale * opts.hpWeight;
    const finalDprMultiplier = (1 - opts.dmgWeight) + dprScale * opts.dmgWeight;

    const newStats = { ...monster.stats };

    newStats.hp = Math.max(1, Math.round((monster.stats.hp || 1) * finalHpMultiplier));

    const abilityScale = (finalHpMultiplier + finalDprMultiplier) / 2;
    const abilities = ["str", "dex", "con", "int", "wis", "cha"] as const;
    for (const ab of abilities) {
        const base = (monster.stats as any)[ab] ?? 10;
        const scaled = Math.round(base * (1 + (abilityScale - 1) * 0.25));
        (newStats as any)[ab] = clamp(scaled, 1, 30);
    }

    const acDiff = tgtRow.expectedAC - (monster.stats.ac ?? tgtRow.expectedAC);
    newStats.ac = clamp(
        Math.round((monster.stats.ac ?? tgtRow.expectedAC) + Math.sign(acDiff) * Math.min(2, Math.abs(acDiff))),
        5,
        30
    );

    const baseAttack = srcRow.atkBonus ?? 0;
    const targetAttack = tgtRow.atkBonus ?? baseAttack;
    const attackDelta = targetAttack - baseAttack;
    const atkAbilityMod = Math.max(abilityModifier(newStats.str), abilityModifier(newStats.dex));
    const finalAttackBonus = Math.round(baseAttack + attackDelta + atkAbilityMod - Math.max(abilityModifier(monster.stats.str), abilityModifier(monster.stats.dex)));

    const baseSave = srcRow.saveDC ?? 10;
    const saveDelta = tgtRow.saveDC - baseSave;
    const abilityModChange = abilityModifier(newStats.int) - abilityModifier(monster.stats.int);
    const finalSaveDC = Math.round(baseSave + saveDelta + abilityModChange);

    if (opts.softClamp) {
        newStats.hp = clamp(newStats.hp, tgtRow.hpMin, Math.max(tgtRow.hpMax, newStats.hp));
    }

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
        tgtDPRMid,
        finalHpMultiplier,
        finalDprMultiplier,
        usedRow: tgtRow,
    };

    return scaled;
}
