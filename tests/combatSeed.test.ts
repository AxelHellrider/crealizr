import { describe, it, expect } from "vitest";
import { seedFromNodes } from "@/app/utils/combatSeed";
import type { EncounterNode } from "@/app/types/encounterLayout";
import type { Monster } from "@/app/types/monster";

const goblin: Monster = {
    name: "Goblin",
    cr: 0.25,
    terrain: ["any"],
    affiliation: "humanoid",
    edition: "2014",
    stats: { ac: 15, hp: 7, speed: "30 ft", str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    actions: [{ name: "Scimitar", damage: "1d6+2" }],
};

const catalog: Monster[] = [goblin];

const partyNode: EncounterNode = { id: "p1", kind: "party", coord: { col: 0, row: 0 } };
const enemyNode: EncounterNode = { id: "e1", kind: "enemy", coord: { col: 0, row: 5 }, cr: 0.25, isBoss: false };

describe("seedFromNodes", () => {
    it("leaves party members with no monster/stat data", () => {
        const [seed] = seedFromNodes([partyNode], catalog);
        expect(seed.kind).toBe("party");
        expect(seed.monsterName).toBeNull();
        expect(seed.ac).toBeNull();
        expect(seed.maxHP).toBeNull();
    });

    it("auto-assigns a matching-CR monster to enemy nodes when a catalog is given", () => {
        const [seed] = seedFromNodes([enemyNode], catalog);
        expect(seed.monsterName).toBe("Goblin");
        expect(seed.ac).toBe(15);
        expect(seed.maxHP).toBe(7);
        expect(seed.currentHP).toBe(7);
        expect(seed.dexMod).toBe(2); // (14-10)/2
        expect(seed.actions).toEqual([{ name: "Scimitar", damage: "1d6+2" }]);
        expect(seed.name).toBe("Goblin"); // no custom label -> falls back to the real monster's name
    });

    it("leaves enemies unresolved when no catalog is provided", () => {
        const [seed] = seedFromNodes([enemyNode]);
        expect(seed.monsterName).toBeNull();
        expect(seed.ac).toBeNull();
        expect(seed.maxHP).toBeNull();
        expect(seed.name).toBe("Monster 1");
    });

    it("keeps a custom label as the display name even when a monster is assigned", () => {
        const labeled: EncounterNode = { ...enemyNode, label: "Sneaky Gob" };
        const [seed] = seedFromNodes([labeled], catalog);
        expect(seed.name).toBe("Sneaky Gob");
        expect(seed.monsterName).toBe("Goblin");
    });

    it("carries the source node's id, not a fresh one", () => {
        const [seed] = seedFromNodes([enemyNode], catalog);
        expect(seed.id).toBe("e1");
    });
});
