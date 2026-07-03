import { scaleMonster2014, scaleMonster2024 } from "@/app/utils/scaler";
import type { MonsterBase, Edition } from "@/app/types/monster";

export type ScaleOptions = {
    acEquipment?: number;
    acRace?: number;
    abilityScoreBonus?: Partial<Record<keyof MonsterBase["stats"], number>>;
};

export function scaleMonster(
    monster: MonsterBase,
    targetCR: number,
    edition: Edition,
    options?: ScaleOptions,
): MonsterBase {
    const fn = edition === "2024" ? scaleMonster2024 : scaleMonster2014;
    return fn(monster, targetCR, options);
}
