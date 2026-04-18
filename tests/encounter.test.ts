import { describe, it, expect } from "vitest";
import { encounterMultiplier, partyBudget, suggestEncounters, suggestGroupEncounters } from "@/app/utils/encounter";

describe("partyBudget", () => {
    it("should return a budget for level 1-10 2014 ruleset", () => {
        const budget = partyBudget({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            mode: "encounter",
        });
        expect(budget).toBe(2000); // 500 * 4
    });

    it("should return a budget for level 11-20 in 2014 ruleset", () => {
        const budget = partyBudget({
            level: 11,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            mode: "encounter",
        });
        expect(budget).toBe(6400); // 1600 * 4
    });

    it("should return a budget for 2024 ruleset", () => {
        const budget = partyBudget({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2024",
            mode: "encounter",
        });
        expect(budget).toBe(2000); // 500 * 4
    });

    it("should handle level out of bounds by clamping", () => {
        const budgetLvl25 = partyBudget({
            level: 25,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            mode: "encounter",
        });
        expect(budgetLvl25).toBe(partyBudget({
            level: 20,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            mode: "encounter",
        }));
    });
});

describe("encounterMultiplier", () => {
    it("applies the DMG multiplier bands", () => {
        expect(encounterMultiplier(1)).toBe(1);
        expect(encounterMultiplier(2)).toBe(1.5);
        expect(encounterMultiplier(3)).toBe(2);
        expect(encounterMultiplier(6)).toBe(2);
        expect(encounterMultiplier(7)).toBe(2.5);
        expect(encounterMultiplier(10)).toBe(2.5);
        expect(encounterMultiplier(11)).toBe(3);
        expect(encounterMultiplier(14)).toBe(3);
        expect(encounterMultiplier(15)).toBe(4);
    });
});

describe("suggestEncounters", () => {
    it("returns suggestions sorted by fit and capped to 12 results", () => {
        const budget = partyBudget({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            mode: "encounter",
        });
        const results = suggestEncounters({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            budget,
        });
        expect(results.length).toBeGreaterThan(0);
        expect(results.length).toBeLessThanOrEqual(12);
        for (let i = 1; i < results.length; i++) {
            expect(results[i - 1].fit).toBeGreaterThanOrEqual(results[i].fit);
        }
        results.forEach((r) => {
            expect(r.fit).toBeGreaterThanOrEqual(0.7);
            expect(r.count).toBeGreaterThanOrEqual(1);
            expect(r.count).toBeLessThanOrEqual(8);
        });
    });

    it("includes reasonable fits near the budget target", () => {
        const budget = 2000;
        const results = suggestEncounters({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            budget,
        });
        const hasCR3x2 = results.some((r) => r.cr === 3 && r.count === 2);
        expect(hasCR3x2).toBe(true);
    });
});

describe("suggestGroupEncounters", () => {
    it("returns grouped suggestions within fit bounds", () => {
        const budget = partyBudget({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            mode: "encounter",
        });
        const results = suggestGroupEncounters({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            budget,
        });
        expect(results.length).toBeGreaterThan(0);
        expect(results.length).toBeLessThanOrEqual(12);
        results.forEach((r) => {
            expect(r.fit).toBeGreaterThanOrEqual(0.7);
            expect(r.totalCount).toBeGreaterThanOrEqual(2);
            expect(r.totalCount).toBeLessThanOrEqual(8);
            const sum = r.members.reduce((acc, m) => acc + m.count, 0);
            expect(sum).toBe(r.totalCount);
        });
    });
});
