import { describe, it, expect } from "vitest";
import { encounterMultiplier, partyBudget, suggestEncounters, suggestGroupEncounters } from "@/app/utils/encounter";

const RULESETS = ["2014", "2024"] as const;

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
            maxTypes: 2,
        });
        expect(results.length).toBeGreaterThan(0);
        expect(results.length).toBeLessThanOrEqual(12);
        results.forEach((r) => {
            expect(r.fit).toBeGreaterThanOrEqual(0.7);
            expect(r.totalCount).toBeGreaterThanOrEqual(2);
            expect(r.totalCount).toBeLessThanOrEqual(8);
            expect(r.members.length).toBeLessThanOrEqual(2);
            const sum = r.members.reduce((acc, m) => acc + m.count, 0);
            expect(sum).toBe(r.totalCount);
        });
    });
});

describe("encounter builder documentation behavior", () => {
    it("applies daily budget multiplier for both rulesets", () => {
        RULESETS.forEach((ruleset) => {
            const encounter = partyBudget({
                level: 3,
                size: 4,
                difficulty: "medium",
                ruleset,
                mode: "encounter",
            });
            const daily = partyBudget({
                level: 3,
                size: 4,
                difficulty: "medium",
                ruleset,
                mode: "daily",
            });
            expect(encounter).toBe(600);
            expect(daily).toBe(Math.round(encounter * 3.4));
        });
    });

    it("keeps solo suggestions within fit bounds for a level 3 party", () => {
        RULESETS.forEach((ruleset) => {
            const budget = partyBudget({
                level: 3,
                size: 4,
                difficulty: "medium",
                ruleset,
                mode: "encounter",
            });
            const results = suggestEncounters({
                level: 3,
                size: 4,
                difficulty: "medium",
                ruleset,
                budget,
            });
            expect(results.length).toBeGreaterThan(0);
            results.forEach((r) => {
                expect(r.fit).toBeGreaterThanOrEqual(0.7);
                expect(r.cr).toBeLessThanOrEqual(3);
            });
        });
    });

    it("keeps group suggestions within fit bounds for a level 3 party", () => {
        RULESETS.forEach((ruleset) => {
            const budget = partyBudget({
                level: 3,
                size: 4,
                difficulty: "medium",
                ruleset,
                mode: "encounter",
            });
            const results = suggestGroupEncounters({
                level: 3,
                size: 4,
                difficulty: "medium",
                ruleset,
                budget,
                maxTypes: 2,
            });
            expect(results.length).toBeGreaterThan(0);
            results.forEach((r) => {
                expect(r.fit).toBeGreaterThanOrEqual(0.7);
                const maxCr = Math.max(...r.members.map((m) => m.cr));
                expect(maxCr).toBeLessThanOrEqual(3);
            });
        });
    });

    it("returns parity between 2014 and 2024 rulesets for identical inputs", () => {
        const budget2014 = partyBudget({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            mode: "encounter",
        });
        const budget2024 = partyBudget({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2024",
            mode: "encounter",
        });

        const solo2014 = suggestEncounters({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            budget: budget2014,
        });
        const solo2024 = suggestEncounters({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2024",
            budget: budget2024,
        });
        const group2014 = suggestGroupEncounters({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            budget: budget2014,
            maxTypes: 2,
        });
        const group2024 = suggestGroupEncounters({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2024",
            budget: budget2024,
            maxTypes: 2,
        });

        expect(solo2024).toEqual(solo2014);
        expect(group2024).toEqual(group2014);
    });

    it("sorts suggestions by fit descending, then by lower adjusted XP", () => {
        const budget = partyBudget({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            mode: "encounter",
        });
        const solo = suggestEncounters({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            budget,
        });
        const groups = suggestGroupEncounters({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            budget,
            maxTypes: 2,
        });

        const assertSorted = (items: { fit: number; adjustedXP: number }[]) => {
            for (let i = 1; i < items.length; i += 1) {
                const prev = items[i - 1];
                const curr = items[i];
                expect(prev.fit).toBeGreaterThanOrEqual(curr.fit);
                if (Math.abs(prev.fit - curr.fit) < 1e-12) {
                    expect(prev.adjustedXP).toBeLessThanOrEqual(curr.adjustedXP);
                }
            }
        };

        assertSorted(solo);
        assertSorted(groups);
    });

    it("supports three-type mixes when enabled", () => {
        const results = suggestGroupEncounters({
            level: 3,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            budget: 2700,
            maxTypes: 3,
        });
        expect(results.length).toBeGreaterThan(0);
        const hasThreeType = results.some((r) => r.members.length === 3 && r.totalCount === 3 && r.adjustedXP === 2700);
        expect(hasThreeType).toBe(true);
    });
});
