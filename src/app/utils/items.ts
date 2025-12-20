export type ItemType = "Weapon" | "Armor" | "Wand" | "Wondrous";
export type ItemRarity = "Common" | "Uncommon" | "Rare" | "Very Rare" | "Legendary";

export type ItemBlueprint = {
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  attunement: boolean;
  levelTuned: number;
  targetTags: string[];
  bonusToHit?: number;
  bonusAC?: number;
  bonusSaveDC?: number;
  avgDamageBonus?: number;
  notes?: string;
};

export function rarityForLevel(level: number): ItemRarity {
  if (level <= 3) return "Common";
  if (level <= 6) return "Uncommon";
  if (level <= 10) return "Rare";
  if (level <= 16) return "Very Rare";
  return "Legendary";
}

export function suggestedBonuses(level: number, type: ItemType) {
  // Keep bonuses conservative for balance; scale softly with level
  const tier = Math.max(1, Math.min(5, Math.ceil(level / 4))); // 1..5
  const bonus = Math.min(3, Math.floor((tier - 1) / 2) + (level >= 17 ? 1 : 0)); // 0..3
  const dmg = Math.max(0, tier - 1); // 0..4 avg damage
  const saveDC = 12 + tier; // 13..17

  return {
    toHit: type === "Weapon" || type === "Wand" ? bonus : undefined,
    ac: type === "Armor" ? bonus : undefined,
    saveDC: type === "Wand" ? saveDC : undefined,
    avgDamage: type === "Weapon" || type === "Wand" ? dmg : undefined,
  };
}

export function buildItem(opts: { name: string; type: ItemType; attunement: boolean; level: number; targets: string[]; }): ItemBlueprint {
  const lvl = Math.max(1, Math.min(20, Math.round(opts.level)));
  const rarity = rarityForLevel(lvl);
  const b = suggestedBonuses(lvl, opts.type);

  return {
    name: opts.name || `${opts.type} of ${rarity}`,
    type: opts.type,
    rarity,
    attunement: opts.attunement,
    levelTuned: lvl,
    targetTags: opts.targets,
    bonusToHit: b.toHit,
    bonusAC: b.ac,
    bonusSaveDC: b.saveDC,
    avgDamageBonus: b.avgDamage,
    notes: opts.targets.length ? `Especially effective against: ${opts.targets.join(", ")}` : undefined,
  };
}
