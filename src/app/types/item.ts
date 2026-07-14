export type ItemType = "Weapon" | "Armor" | "Wand" | "Wondrous";
export type ItemRarity = "Common" | "Uncommon" | "Rare" | "Very Rare" | "Legendary";

export type ItemBlueprint = {
    name: string;
    type: ItemType;
    rarity: ItemRarity;
    attunement: boolean;
    levelTuned: number;
    targetTags: string[];
    ingredients: { name: string; quantity: number; unit?: string }[];
    craftingCost?: number;
    craftingTime?: number;
    craftingTimeUnit?: "hours" | "days" | "weeks";
    craftingRequirement?: string;
    lore?: string;
    bonusToHit?: number;
    bonusAC?: number;
    bonusSaveDC?: number;
    avgDamageBonus?: number;
    notes?: string;
};
