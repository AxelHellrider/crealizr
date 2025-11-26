import monsters2014 from "./2014_5e.json";
import monsters2024 from "./2024_5_5e.json";
import { type MonsterJSON } from "@/app/types/monsters_schema";

export const monstersByEdition: Record<string, MonsterJSON> = {
    "2014": monsters2014,
    "2024": monsters2024
};

/** Utility function to get a monster by edition & slug */
export function getMonster(edition: "2014" | "2024", slug: string) {
    return monstersByEdition[edition][slug] ?? null;
}

/** List all monsters of an edition */
export function listMonsters(edition: "2014" | "2024") {
    return Object.values(monstersByEdition[edition]);
}
