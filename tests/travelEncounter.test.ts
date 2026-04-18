import { describe, it, expect } from "vitest";
import { getTravelEncounter, rollD200, TRAVEL_ENCOUNTER_TABLES } from "@/app/utils/travelEncounter";

describe("rollD200", () => {
  it("returns values from 1 to 200", () => {
    for (let i = 0; i < 100; i++) {
      const roll = rollD200();
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(200);
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

  it("filters by encounter type and maps roll to filtered list", () => {
    const firstCombat = getTravelEncounter("Forest", 1, "combat");
    expect(firstCombat?.type).toBe("combat");
    expect(firstCombat?.description).toContain("wolves");

    const lastCombat = getTravelEncounter("Forest", 200, "combat");
    expect(lastCombat?.type).toBe("combat");
    expect(lastCombat?.description).toContain("owlbears");
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
});
