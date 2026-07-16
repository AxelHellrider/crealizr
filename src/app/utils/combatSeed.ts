import type { EncounterNode } from "@/app/types/encounterLayout";
import type { Combatant } from "@/app/types/combat";
import type { ConditionId } from "@/app/data/conditions";

export type CombatantSeed = Omit<Combatant, "id" | "initiative" | "conditions"> & {
    initiative?: number | null;
    conditions?: ConditionId[];
};

/** Party/enemy nodes currently on the map, turned into a starting combatant
 * list — HP isn't tracked on nodes at all (see encounterLayout.ts), so it
 * always starts blank; conditions carry over since nodes already track those. */
export function seedFromNodes(nodes: EncounterNode[]): CombatantSeed[] {
    let pcCount = 0;
    let monsterCount = 0;
    return nodes
        .filter((n): n is Extract<EncounterNode, { kind: "party" | "enemy" }> => n.kind === "party" || n.kind === "enemy")
        .map((n) => {
            let name: string;
            if (n.kind === "party") { pcCount++; name = n.label || `PC ${pcCount}`; }
            else if (n.isBoss) { name = n.label || "Boss"; }
            else { monsterCount++; name = n.label || `Monster ${monsterCount}`; }
            return {
                name,
                kind: n.kind,
                isBoss: n.kind === "enemy" ? n.isBoss : undefined,
                maxHP: null,
                currentHP: null,
                conditions: n.conditions ?? [],
            };
        });
}
