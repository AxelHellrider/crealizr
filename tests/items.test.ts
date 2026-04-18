import { describe, it, expect } from "vitest";
import { buildItem, rarityForLevel, suggestedBonuses } from "@/app/utils/items";

describe("rarityForLevel", () => {
  it("maps levels to the correct rarity band", () => {
    expect(rarityForLevel(1)).toBe("Common");
    expect(rarityForLevel(4)).toBe("Uncommon");
    expect(rarityForLevel(7)).toBe("Rare");
    expect(rarityForLevel(12)).toBe("Very Rare");
    expect(rarityForLevel(20)).toBe("Legendary");
  });
});

describe("suggestedBonuses", () => {
  it("returns bonuses for weapon and wand types", () => {
    const bonuses = suggestedBonuses(8, "Weapon");
    expect(bonuses.toHit).toBe(2);
    expect(bonuses.avgDamage).toBe(2);
  });

  it("returns save DC for wands", () => {
    const bonuses = suggestedBonuses(8, "Wand");
    expect(bonuses.saveDC).toBe(15);
  });

  it("returns no automatic bonuses for wondrous items", () => {
    const bonuses = suggestedBonuses(8, "Wondrous");
    expect(bonuses.toHit).toBeUndefined();
    expect(bonuses.ac).toBeUndefined();
    expect(bonuses.saveDC).toBeUndefined();
    expect(bonuses.avgDamage).toBeUndefined();
  });
});

describe("buildItem", () => {
  it("clamps level and applies defaults", () => {
    const item = buildItem({
      name: "",
      type: "Armor",
      attunement: false,
      level: 50,
      targets: [],
    });
    expect(item.levelTuned).toBe(20);
    expect(item.rarity).toBe("Legendary");
    expect(item.name).toBe("Armor of Legendary");
    expect(item.ingredients).toEqual([]);
  });

  it("adds notes when targets are supplied", () => {
    const item = buildItem({
      name: "Frostbrand",
      type: "Weapon",
      attunement: true,
      level: 5,
      targets: ["undead", "fiend"],
    });
    expect(item.notes).toContain("undead");
    expect(item.notes).toContain("fiend");
  });

  it("preserves crafting and lore fields", () => {
    const item = buildItem({
      name: "Cinderleaf Wand",
      type: "Wand",
      attunement: false,
      level: 5,
      targets: [],
      ingredients: [{ name: "Cinderleaf", quantity: 2 }],
      craftingCost: 150,
      craftingTime: 2,
      craftingTimeUnit: "days",
      craftingRequirement: "Crafted in a druidic grove.",
      lore: "An ember-warm wand that encourages wild growth.",
    });
    expect(item.ingredients.length).toBe(1);
    expect(item.craftingCost).toBe(150);
    expect(item.craftingTimeUnit).toBe("days");
    expect(item.craftingRequirement).toContain("grove");
    expect(item.lore).toContain("ember-warm");
  });
});
