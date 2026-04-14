import { describe, it, expect } from "vitest";
import { partyBudget } from "@/app/utils/encounter";

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
