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

type RarityBand = { maxLevel: number; rarity: ItemRarity };

type RulesetConfig = {
  rarityByLevel: RarityBand[];
  bonusByRarity: Record<ItemRarity, number>;
  avgDamageByRarity: Record<ItemRarity, number>;
  saveDCByRarity: Record<ItemRarity, number>;
};

const ITEM_TUNING: RulesetConfig = {
  rarityByLevel: [
    { maxLevel: 3, rarity: "Common" },
    { maxLevel: 6, rarity: "Uncommon" },
    { maxLevel: 10, rarity: "Rare" },
    { maxLevel: 16, rarity: "Very Rare" },
    { maxLevel: 20, rarity: "Legendary" },
  ],
  bonusByRarity: {
    Common: 0,
    Uncommon: 1,
    Rare: 2,
    "Very Rare": 3,
    Legendary: 3,
  },
  avgDamageByRarity: {
    Common: 0,
    Uncommon: 1,
    Rare: 2,
    "Very Rare": 3,
    Legendary: 3,
  },
  saveDCByRarity: {
    Common: 13,
    Uncommon: 13,
    Rare: 15,
    "Very Rare": 17,
    Legendary: 19,
  },
};

function clampLevel(level: number) {
  return Math.max(1, Math.min(20, Math.round(level)));
}

export function rarityForLevel(level: number): ItemRarity {
  for (const band of ITEM_TUNING.rarityByLevel) {
    if (level <= band.maxLevel) return band.rarity;
  }
  return ITEM_TUNING.rarityByLevel[ITEM_TUNING.rarityByLevel.length - 1].rarity;
}

export function suggestedBonuses(level: number, type: ItemType) {
  const rarity = rarityForLevel(level);
  const bonus = ITEM_TUNING.bonusByRarity[rarity];
  const avgDamage = ITEM_TUNING.avgDamageByRarity[rarity];
  const saveDC = ITEM_TUNING.saveDCByRarity[rarity];
  const toHit = bonus > 0 ? bonus : undefined;
  const ac = bonus > 0 ? bonus : undefined;
  const avgDamageBonus = avgDamage > 0 ? avgDamage : undefined;

  return {
    toHit: type === "Weapon" || type === "Wand" ? toHit : undefined,
    ac: type === "Armor" ? ac : undefined,
    saveDC: type === "Wand" ? saveDC : undefined,
    avgDamage: type === "Weapon" || type === "Wand" ? avgDamageBonus : undefined,
  };
}

export function buildItem(opts: {
  name: string;
  type: ItemType;
  attunement: boolean;
  level: number;
  targets: string[];
  ingredients?: { name: string; quantity: number; unit?: string }[];
  craftingCost?: number;
  craftingTime?: number;
  craftingTimeUnit?: "hours" | "days" | "weeks";
  craftingRequirement?: string;
  lore?: string;
}): ItemBlueprint {
  const lvl = clampLevel(opts.level);
  const rarity = rarityForLevel(lvl);
  const b = suggestedBonuses(lvl, opts.type);

  return {
    name: opts.name || `${opts.type} of ${rarity}`,
    type: opts.type,
    rarity,
    attunement: opts.attunement,
    levelTuned: lvl,
    targetTags: opts.targets,
    ingredients: opts.ingredients ?? [],
    craftingCost: opts.craftingCost,
    craftingTime: opts.craftingTime,
    craftingTimeUnit: opts.craftingTimeUnit,
    craftingRequirement: opts.craftingRequirement,
    lore: opts.lore,
    bonusToHit: b.toHit,
    bonusAC: b.ac,
    bonusSaveDC: b.saveDC,
    avgDamageBonus: b.avgDamage,
    notes: opts.targets.length ? `Especially effective against: ${opts.targets.join(", ")}` : undefined,
  };
}
