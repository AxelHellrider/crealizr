import type { EncounterNode } from "@/app/types/encounterLayout";
import type { Combatant } from "@/app/types/combat";
import type { ConditionId } from "@/app/data/conditions";
import type { Monster } from "@/app/types/monster";
import { pickMonsterManualBenchmark, type Ruleset } from "@/engine/encounter";

export type CombatantSeed = Omit<Combatant, "initiative" | "dexMod" | "initiativeRoll" | "conditions"> & {
    initiative?: number | null;
    dexMod?: number | null;
    initiativeRoll?: number | null;
    conditions?: ConditionId[];
};

/** Party/enemy nodes currently on the map, turned into a starting combatant
 * list. Enemy nodes only ever carry an abstract CR ("2 CR-3 enemies") — no
 * link to a specific catalog monster — so each one gets a real creature
 * auto-assigned here (same benchmark-picking logic the encounter suggestions
 * themselves use), which is what makes AC/HP/actions/DEX available to the
 * combat tracker at all. Pass a `catalog` (official + homebrew, matching the
 * encounter's ruleset) to enable this; omit it and enemies stay unresolved
 * (blank stats, no monsterName) exactly like before. Party members never had
 * stat data and still don't — no PC data model exists yet.
 *
 * The seed's id is the source node's id, not a fresh one — this is what lets
 * CombatContext.syncNewCombatants() tell "already in the fight" apart from
 * "just placed, needs to join" when the DM pauses mid-battle to add
 * reinforcements (see EncounterHexMap's "Resume Battle Mode" action). */
export function seedFromNodes(nodes: EncounterNode[], catalog: readonly Monster[] = [], ruleset: Ruleset = "2014"): CombatantSeed[] {
    let pcCount = 0;
    let monsterCount = 0;
    return nodes
        .filter((n): n is Extract<EncounterNode, { kind: "party" | "enemy" }> => n.kind === "party" || n.kind === "enemy")
        .map((n, i) => {
            let name: string;
            if (n.kind === "party") { pcCount++; name = n.label || `PC ${pcCount}`; }
            else if (n.isBoss) { name = n.label || "Boss"; }
            else { monsterCount++; name = n.label || `Monster ${monsterCount}`; }

            let cr: number | null = null;
            let monsterName: string | null = null;
            let ac: number | null = null;
            let maxHP: number | null = null;
            let dexMod: number | null = null;
            let actions: Combatant["actions"] = [];

            if (n.kind === "enemy") {
                cr = n.cr;
                const monster = catalog.length > 0 ? pickMonsterManualBenchmark(n.cr, i, ruleset, catalog) : undefined;
                if (monster) {
                    monsterName = monster.name;
                    if (!n.label) name = monster.name;
                    if (monster.stats) {
                        ac = monster.stats.ac;
                        maxHP = monster.stats.hp;
                        dexMod = Math.floor((monster.stats.dex - 10) / 2);
                    }
                    actions = monster.actions ?? [];
                }
            }

            return {
                id: n.id,
                name,
                kind: n.kind,
                isBoss: n.kind === "enemy" ? n.isBoss : undefined,
                cr,
                monsterName,
                ac,
                actions,
                dexMod,
                initiativeRoll: null,
                maxHP,
                currentHP: maxHP,
                conditions: n.conditions ?? [],
            };
        });
}
