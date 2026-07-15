import { describe, it, expect } from "vitest";
import { rollDie, rollD20 } from "@/app/utils/dice";

describe("rollDie", () => {
  it("stays within 1..sides across many rolls", () => {
    for (let i = 0; i < 500; i++) {
      const roll = rollDie(6);
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(6);
      expect(Number.isInteger(roll)).toBe(true);
    }
  });

  it("handles a d1 as always 1", () => {
    expect(rollDie(1)).toBe(1);
  });
});

describe("rollD20", () => {
  it("stays within 1..20 with no modifier", () => {
    for (let i = 0; i < 500; i++) {
      const roll = rollD20();
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(20);
    }
  });

  it("applies a positive or negative modifier", () => {
    for (let i = 0; i < 200; i++) {
      const roll = rollD20(5);
      expect(roll).toBeGreaterThanOrEqual(6);
      expect(roll).toBeLessThanOrEqual(25);
    }
    for (let i = 0; i < 200; i++) {
      const roll = rollD20(-3);
      expect(roll).toBeGreaterThanOrEqual(-2);
      expect(roll).toBeLessThanOrEqual(17);
    }
  });
});
