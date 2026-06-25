import { describe, it, expect } from "vitest";
import {
    MONSTER_MANUAL_2014_CATALOG,
    encounterMultiplier,
    partyBudget,
    recommendMonstersForParty,
    suggestEncounters,
    suggestGroupEncounters,
} from "@/app/utils/encounter";

describe("encounterMultiplier", () => {
    it("returns 1 for a single monster", () => {
        expect(encounterMultiplier(1)).toBe(1);
    });
    it("returns 1.5 for 2 monsters", () => {
        expect(encounterMultiplier(2)).toBe(1.5);
    });
    it("returns 2 for 3-6 monsters", () => {
        expect(encounterMultiplier(3)).toBe(2);
        expect(encounterMultiplier(6)).toBe(2);
    });
    it("returns 2.5 for 7-10 monsters", () => {
        expect(encounterMultiplier(7)).toBe(2.5);
        expect(encounterMultiplier(10)).toBe(2.5);
    });
    it("returns 3 for 11-14 monsters", () => {
        expect(encounterMultiplier(11)).toBe(3);
        expect(encounterMultiplier(14)).toBe(3);
    });
    it("returns 4 for 15+ monsters", () => {
        expect(encounterMultiplier(15)).toBe(4);
        expect(encounterMultiplier(20)).toBe(4);
    });
});

describe("partyBudget", () => {
    it("returns a positive number for valid inputs", () => {
        const result = partyBudget({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            mode: "encounter",
        });
        expect(result).toBeGreaterThan(0);
    });
    it("scales with party size", () => {
        const small = partyBudget({ level: 5, size: 3, difficulty: "medium", ruleset: "2014", mode: "encounter" });
        const big = partyBudget({ level: 5, size: 6, difficulty: "medium", ruleset: "2014", mode: "encounter" });
        expect(big).toBeGreaterThan(small);
    });
    it("scales with difficulty", () => {
        const easy = partyBudget({ level: 5, size: 4, difficulty: "easy", ruleset: "2014", mode: "encounter" });
        const deadly = partyBudget({ level: 5, size: 4, difficulty: "deadly", ruleset: "2014", mode: "encounter" });
        expect(deadly).toBeGreaterThan(easy);
    });
});

describe("suggestEncounters", () => {
    it("returns suggestions with fit >= 0.7", () => {
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
        results.forEach((r) => {
            expect(r.fit).toBeGreaterThanOrEqual(0.7);
            expect(r.cr).toBeGreaterThanOrEqual(0);
            expect(r.count).toBeGreaterThanOrEqual(1);
            expect(r.adjustedXP).toBeGreaterThan(0);
        });
    });

    it("sorts by highest fit first", () => {
        const budget = partyBudget({ level: 5, size: 4, difficulty: "hard", ruleset: "2014", mode: "encounter" });
        const results = suggestEncounters({ level: 5, size: 4, difficulty: "hard", ruleset: "2014", budget });
        for (let i = 1; i < results.length; i++) {
            expect(results[i - 1].fit).toBeGreaterThanOrEqual(results[i].fit);
        }
    });
});

describe("suggestGroupEncounters", () => {
    it("returns mixed-CR group suggestions", () => {
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
            expect(r.members.length).toBeLessThanOrEqual(2);
            const sum = r.members.reduce((acc, m) => acc + m.count, 0);
            expect(sum).toBe(r.totalCount);
        });
    });
});

describe("recommendMonstersForParty", () => {
    it("returns recommendations with named monsters from the catalog", () => {
        const budget = partyBudget({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            mode: "encounter",
        });
        const results = recommendMonstersForParty({
            level: 5,
            size: 4,
            difficulty: "medium",
            ruleset: "2014",
            budget,
        });

        expect(results.length).toBeGreaterThan(0);
        expect(results.length).toBeLessThanOrEqual(6);
        results.forEach((recommendation) => {
            expect(recommendation.members.length).toBeGreaterThan(0);
            expect(recommendation.fit).toBeGreaterThanOrEqual(0.7);
            expect(recommendation.totalCount).toBeGreaterThanOrEqual(1);
            recommendation.members.forEach((member) => {
                expect(member.name).toBeTruthy();
                expect(member.benchmarkCr).toBeGreaterThanOrEqual(0);
                expect(member.crDelta).toBeGreaterThanOrEqual(0);
                expect(["exact", "nearest"]).toContain(member.matchQuality);
                expect(member.count).toBeGreaterThanOrEqual(1);
            });
        });
    });

    it("uses 2014 Monster Manual names for comparison", () => {
        const catalogNames = new Set(MONSTER_MANUAL_2014_CATALOG.map((monster) => monster.name));

        expect(catalogNames.has("Owlbear")).toBe(true);
        expect(catalogNames.has("Beholder (not in lair)")).toBe(true);
        expect(catalogNames.has("Tarrasque")).toBe(true);
    });

    it("honors the requested recommendation limit", () => {
        const results = recommendMonstersForParty({
            level: 10,
            size: 5,
            difficulty: "hard",
            ruleset: "2024",
            budget: 9500,
            limit: 3,
        });

        expect(results.length).toBeLessThanOrEqual(3);
    });
});
