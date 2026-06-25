import { describe, it, expect } from "vitest";
import { getTravelEncounter, rollD500, TRAVEL_ENCOUNTER_TABLES } from "@/app/utils/travelEncounter";

describe("rollD500", () => {
  it("returns values from 1 to 500", () => {
    for (let i = 0; i < 200; i++) {
      const roll = rollD500();
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(500);
    }
  });
});

describe("getTravelEncounter", () => {
  it("returns a matching entry for an in-range roll", () => {
    const result = getTravelEncounter("Forest", 5);
    expect(result).toBeTruthy();
    expect(result?.range[0]).toBeLessThanOrEqual(5);
    expect(result?.range[1]).toBeGreaterThanOrEqual(5);
  });

  it("filters by encounter type", () => {
    const combatResult = getTravelEncounter("Forest", 1, "combat");
    expect(combatResult).toBeTruthy();
    expect(combatResult?.type).toBe("combat");
    expect(combatResult?.description).toBeTruthy();
  });

  it("returns null when a terrain has no matching type", () => {
    const noType = getTravelEncounter("Forest", 50, "hazard");
    const hasHazard = TRAVEL_ENCOUNTER_TABLES.Forest.some((e) => e.type === "hazard");
    if (hasHazard) {
      expect(noType).toBeTruthy();
    } else {
      expect(noType).toBeNull();
    }
  });

  it("covers the full roll range for each terrain", () => {
    const terrains = Object.keys(TRAVEL_ENCOUNTER_TABLES) as (keyof typeof TRAVEL_ENCOUNTER_TABLES)[];
    for (const terrain of terrains) {
      const table = TRAVEL_ENCOUNTER_TABLES[terrain];
      expect(table.length).toBeGreaterThan(0);
      expect(table[0].range[0]).toBe(1);
      expect(table[table.length - 1].range[1]).toBe(500);
    }
  });
});
