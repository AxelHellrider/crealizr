import { scaleMonster as scaleMonsterEngine, type ScaleOptions } from "@/app/utils/scaler";
import type { MonsterBase } from "@/app/types/monster";

export type { ScaleOptions };

export function scaleMonster(
    monster: MonsterBase,
    targetCR: number,
    options?: ScaleOptions,
): MonsterBase {
    return scaleMonsterEngine(monster, targetCR, options);
}
