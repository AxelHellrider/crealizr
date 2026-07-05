import { describe, it, expect } from "vitest";
import {
    MONSTER_MANUAL_2014_CATALOG,
    encounterMultiplier,
    partyBudget,
    recommendMonstersForParty,
    suggestEncounters,
    suggestGroupEncounters,
    crTarget,
    crEncounterWeight,
    crBudgetForParty,
    suggestBossWithMinionsCR,
    suggestGroupEncountersCR,
} from "@/app/utils/encounter";
import { buildEncounterSuggestions } from "@/app/services/encounterService";

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

// ── CR mode tests ─────────────────────────────────────────────────────────────

describe("crTarget", () => {
    it("returns a lower CR for easier difficulties", () => {
        const easy   = crTarget(5, "easy");
        const medium = crTarget(5, "medium");
        const hard   = crTarget(5, "hard");
        const deadly = crTarget(5, "deadly");
        expect(easy).toBeLessThan(medium);
        expect(medium).toBeLessThan(hard);
        expect(hard).toBeLessThan(deadly);
    });

    it("returns at least 0.125 even for low-level easy encounters", () => {
        expect(crTarget(1, "easy")).toBeGreaterThanOrEqual(0.125);
        expect(crTarget(2, "easy")).toBeGreaterThanOrEqual(0.125);
    });

    it("scales with party level", () => {
        expect(crTarget(10, "medium")).toBeGreaterThan(crTarget(5, "medium"));
    });

    it("returns expected values for standard cases", () => {
        // medium offset = 0: target = level
        expect(crTarget(5,  "medium")).toBe(5);
        expect(crTarget(10, "medium")).toBe(10);
        // hard offset = +1
        expect(crTarget(5,  "hard")).toBe(6);
        // deadly offset = +3
        expect(crTarget(5,  "deadly")).toBe(8);
        // easy offset = -2, min 0.125
        expect(crTarget(5,  "easy")).toBe(3);
        expect(crTarget(1,  "easy")).toBe(0.125);
    });
});

describe("crEncounterWeight", () => {
    it("single monster has weight equal to CR times sqrt(multiplier(1)=1)", () => {
        expect(crEncounterWeight([{ cr: 5, count: 1 }])).toBeCloseTo(5, 4);
    });

    it("increases with more monsters due to sqrt(multiplier) factor", () => {
        const single = crEncounterWeight([{ cr: 3, count: 1 }]);
        const pair   = crEncounterWeight([{ cr: 3, count: 2 }]);
        expect(pair).toBeGreaterThan(single);
    });

    it("aggregates multiple types", () => {
        const weight = crEncounterWeight([{ cr: 4, count: 1 }, { cr: 2, count: 2 }]);
        // totalCR=8, totalCount=3, multiplier=2, sqrt(2)≈1.414
        expect(weight).toBeCloseTo(8 * Math.sqrt(2), 4);
    });
});

describe("crBudgetForParty", () => {
    it("scales linearly with party size", () => {
        const small = crBudgetForParty(5, 4, "medium");
        const large = crBudgetForParty(5, 8, "medium");
        expect(large).toBeCloseTo(small * 2, 4);
    });

    it("is exactly crTarget for a party of 4", () => {
        expect(crBudgetForParty(5, 4, "medium")).toBe(crTarget(5, "medium"));
        expect(crBudgetForParty(8, 4, "hard")).toBe(crTarget(8, "hard"));
    });
});

describe("suggestBossWithMinionsCR — no-XP mode", () => {
    const BASE = { level: 5, size: 4, ruleset: "2014" as const, includeMinions: false };

    it("returns up to 12 suggestions", () => {
        const results = suggestBossWithMinionsCR({ ...BASE, difficulty: "medium" });
        expect(results.length).toBeGreaterThan(0);
        expect(results.length).toBeLessThanOrEqual(12);
    });

    it("all fits are >= 0.5", () => {
        const results = suggestBossWithMinionsCR({ ...BASE, difficulty: "hard" });
        results.forEach(r => expect(r.fit).toBeGreaterThanOrEqual(0.5));
    });

    it("sorted by fit descending", () => {
        const results = suggestBossWithMinionsCR({ ...BASE, difficulty: "medium" });
        for (let i = 1; i < results.length; i++) {
            expect(results[i - 1].fit).toBeGreaterThanOrEqual(results[i].fit);
        }
    });

    it("boss CR is near crTarget for medium difficulty", () => {
        const target = crTarget(5, "medium"); // 5
        const results = suggestBossWithMinionsCR({ ...BASE, difficulty: "medium" });
        // Best suggestion boss CR should be within ±2 of target
        expect(Math.abs(results[0].boss.cr - target)).toBeLessThanOrEqual(2);
    });

    it("suggests harder bosses for deadly than easy", () => {
        const easyResults   = suggestBossWithMinionsCR({ ...BASE, difficulty: "easy" });
        const deadlyResults = suggestBossWithMinionsCR({ ...BASE, difficulty: "deadly" });
        const avgEasy   = easyResults[0].boss.cr;
        const avgDeadly = deadlyResults[0].boss.cr;
        expect(avgDeadly).toBeGreaterThanOrEqual(avgEasy);
    });

    it("adjustedXP represents CR weight (non-XP, decimal)", () => {
        const results = suggestBossWithMinionsCR({ ...BASE, difficulty: "medium" });
        results.forEach(r => {
            // In CR mode adjustedXP is the CR encounter weight, not raw XP
            expect(r.adjustedXP).toBeGreaterThan(0);
            expect(r.adjustedXP).toBeLessThan(100); // CR values are small
        });
    });
});

describe("suggestGroupEncountersCR — no-XP mode", () => {
    const BASE = { level: 5, size: 4, ruleset: "2014" as const };

    it("returns up to 12 suggestions", () => {
        const results = suggestGroupEncountersCR({ ...BASE, difficulty: "medium" });
        expect(results.length).toBeGreaterThan(0);
        expect(results.length).toBeLessThanOrEqual(12);
    });

    it("all fits are >= 0.5", () => {
        const results = suggestGroupEncountersCR({ ...BASE, difficulty: "medium" });
        results.forEach(r => expect(r.fit).toBeGreaterThanOrEqual(0.5));
    });

    it("sorted by fit descending", () => {
        const results = suggestGroupEncountersCR({ ...BASE, difficulty: "medium" });
        for (let i = 1; i < results.length; i++) {
            expect(results[i - 1].fit).toBeGreaterThanOrEqual(results[i].fit);
        }
    });

    it("individual monster CRs are within a reasonable range of crTarget", () => {
        const target = crTarget(5, "medium"); // 5
        const results = suggestGroupEncountersCR({ ...BASE, difficulty: "medium" });
        results.forEach(r => {
            r.members.forEach(m => {
                expect(m.cr).toBeGreaterThanOrEqual(0.125);
                // Each member CR should be at most 4× the target
                expect(m.cr).toBeLessThanOrEqual(target * 4 + 1);
            });
        });
    });

    it("member counts sum to totalCount", () => {
        const results = suggestGroupEncountersCR({ ...BASE, difficulty: "hard" });
        results.forEach(r => {
            const sum = r.members.reduce((s, m) => s + m.count, 0);
            expect(sum).toBe(r.totalCount);
        });
    });

    it("suggests higher-CR monsters for harder difficulties", () => {
        const easyBest  = suggestGroupEncountersCR({ ...BASE, difficulty: "easy" })[0];
        const hardBest  = suggestGroupEncountersCR({ ...BASE, difficulty: "hard" })[0];
        const easyAvg   = easyBest.members.reduce((s, m) => s + m.cr * m.count, 0) / easyBest.totalCount;
        const hardAvg   = hardBest.members.reduce((s, m) => s + m.cr * m.count, 0) / hardBest.totalCount;
        expect(hardAvg).toBeGreaterThanOrEqual(easyAvg);
    });
});

describe("buildEncounterSuggestions — useXP flag", () => {
    const BASE_OPTS = {
        level: 5, size: 4, difficulty: "medium" as const,
        ruleset: "2014" as const, budgetMode: "encounter" as const,
        mode: "solo" as const, includeMinions: false,
        groupTypes: 2, relationCriteria: "any" as const,
    };
    const catalog = MONSTER_MANUAL_2014_CATALOG;

    it("useXP=true returns XP budget (large number)", () => {
        const { budget } = buildEncounterSuggestions({ ...BASE_OPTS, useXP: true }, catalog);
        // XP budget for level-5, 4 PCs, medium = 2000
        expect(budget).toBe(2000);
    });

    it("useXP=false returns CR budget (small number = crTarget * size/4)", () => {
        const { budget } = buildEncounterSuggestions({ ...BASE_OPTS, useXP: false }, catalog);
        // crBudgetForParty(5, 4, "medium") = crTarget(5,"medium") * 1 = 5
        expect(budget).toBe(crTarget(5, "medium"));
    });

    it("useXP=true produces soloSuggestions with high adjustedXP values", () => {
        const { soloSuggestions } = buildEncounterSuggestions({ ...BASE_OPTS, useXP: true }, catalog);
        soloSuggestions.forEach(s => expect(s.adjustedXP).toBeGreaterThan(100));
    });

    it("useXP=false produces soloSuggestions with low adjustedXP (CR weight)", () => {
        const { soloSuggestions } = buildEncounterSuggestions({ ...BASE_OPTS, useXP: false }, catalog);
        expect(soloSuggestions.length).toBeGreaterThan(0);
        soloSuggestions.forEach(s => expect(s.adjustedXP).toBeLessThan(100));
    });

    it("useXP=false group suggestions fit >= 0.5", () => {
        const { groupSuggestions } = buildEncounterSuggestions({ ...BASE_OPTS, useXP: false, mode: "group" }, catalog);
        expect(groupSuggestions.length).toBeGreaterThan(0);
        groupSuggestions.forEach(s => expect(s.fit).toBeGreaterThanOrEqual(0.5));
    });

    it("useXP=true group suggestions fit >= 0.7", () => {
        const { groupSuggestions } = buildEncounterSuggestions({ ...BASE_OPTS, useXP: true, mode: "group" }, catalog);
        expect(groupSuggestions.length).toBeGreaterThan(0);
        groupSuggestions.forEach(s => expect(s.fit).toBeGreaterThanOrEqual(0.7));
    });

    it("switching useXP changes the suggestions", () => {
        const xp = buildEncounterSuggestions({ ...BASE_OPTS, useXP: true }, catalog);
        const cr = buildEncounterSuggestions({ ...BASE_OPTS, useXP: false }, catalog);
        // Budgets must differ significantly
        expect(xp.budget).toBeGreaterThan(cr.budget * 10);
        // Top XP suggestion adjustedXP must be >> top CR suggestion adjustedXP
        expect(xp.soloSuggestions[0].adjustedXP).toBeGreaterThan(
            cr.soloSuggestions[0].adjustedXP * 50
        );
    });

    it("both modes work at high party level (level 20, deadly)", () => {
        const opts = { ...BASE_OPTS, level: 20, difficulty: "deadly" as const };
        const xp = buildEncounterSuggestions({ ...opts, useXP: true }, catalog);
        const cr = buildEncounterSuggestions({ ...opts, useXP: false }, catalog);
        expect(xp.soloSuggestions.length).toBeGreaterThan(0);
        expect(cr.soloSuggestions.length).toBeGreaterThan(0);
    });

    it("both modes execute without errors at low party level (level 1, easy)", () => {
        const opts = { ...BASE_OPTS, level: 1, difficulty: "easy" as const };
        // XP mode may produce 0 boss suggestions at level 1 easy (budget too low for fit≥0.7)
        expect(() => buildEncounterSuggestions({ ...opts, useXP: true }, catalog)).not.toThrow();
        // CR mode should still produce boss suggestions at level 1 easy (fit threshold 0.5)
        const cr = buildEncounterSuggestions({ ...opts, useXP: false }, catalog);
        expect(cr.soloSuggestions.length).toBeGreaterThan(0);
        cr.soloSuggestions.forEach(s => expect(s.fit).toBeGreaterThanOrEqual(0.5));
    });
});
