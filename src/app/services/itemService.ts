import {
    buildItem,
    rarityForLevel,
    suggestedBonuses,
    type ItemType,
    type ItemRarity,
    type ItemBlueprint,
} from "@/app/utils/items";

export type { ItemType, ItemRarity, ItemBlueprint };
export type ItemOpts = Parameters<typeof buildItem>[0];
export type AutoSuggestions = ReturnType<typeof suggestedBonuses>;

export function buildItemBlueprint(opts: ItemOpts): ItemBlueprint {
    return buildItem(opts);
}

export function getAutoSuggestions(level: number, type: ItemType): AutoSuggestions {
    return suggestedBonuses(level, type);
}

export { rarityForLevel };
