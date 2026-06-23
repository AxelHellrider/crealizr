export type Terrain = "dungeon" | "wilderness" | "urban" | "underwater" | "planar" | "any";
export type Affiliation = "humanoid" | "beast" | "undead" | "construct" | "dragon" | "fiend" | "celestial" | "fey" | "monstrosity" | "giant" | "elemental" | "aberration" | "plant" | "any";
export type Edition = "2014" | "2024";
export type MonsterSize = "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";

export type MonsterAction = {
    name: string;
    damage?: string;
    [key: string]: unknown;
};

export type MonsterStats = {
    ac: number;
    hp: number;
    speed: string;
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
};

export interface Monster {
    name: string;
    cr: number;
    terrain: Terrain[];
    affiliation: Affiliation;
    genus?: string;
    edition: Edition;

    size?: MonsterSize;
    type?: string;
    alignment?: string;
    xp?: number;
    dpr?: { min: number; max: number; range: string };
    stats?: MonsterStats;
    actions?: MonsterAction[];
    traits?: MonsterAction[];
    legendary_actions?: MonsterAction[];
    reactions?: MonsterAction[];

    source?: "srd" | "homebrew";
    raw_source_ref?: string;
    cr_formula_hint?: string;
}

export type MonsterWithStatBlock = Monster & Required<Pick<Monster, "stats" | "dpr" | "size" | "xp">>;

export type MonsterBase = MonsterWithStatBlock;
export type MonsterJSON = Record<string, Monster>;
