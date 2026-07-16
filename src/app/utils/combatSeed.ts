import type { EncounterNode } from "@/app/types/encounterLayout";
import type { Combatant } from "@/app/types/combat";
import type { ConditionId } from "@/app/data/conditions";

export type CombatantSeed = Omit<Combatant, "initiative" | "dexMod" | "initiativeRoll" | "conditions"> & {
    initiative?: number | null;
    dexMod?: number | null;
    initiativeRoll?: number | null;
    conditions?: ConditionId[];
};

/** Party/enemy nodes currently on the map, turned into a starting combatant
 * list — HP isn't tracked on nodes at all (see encounterLayout.ts), so it
 * always starts blank; conditions carry over since nodes already track those.
 *
 * The seed's id is the source node's id, not a fresh one — this is what lets
 * CombatContext.syncNewCombatants() tell "already in the fight" apart from
 * "just placed, needs to join" when the DM pauses mid-battle to add
 * reinforcements (see EncounterHexMap's "Resume Battle Mode" action). */
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
                id: n.id,
                name,
                kind: n.kind,
                isBoss: n.kind === "enemy" ? n.isBoss : undefined,
                dexMod: null,
                initiativeRoll: null,
                maxHP: null,
                currentHP: null,
                conditions: n.conditions ?? [],
            };
        });
}
