export interface MonsterBase {
    name: string;
    edition: "2014" | "2024";
    size: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
    type: string;
    alignment: string;
    challenge_rating: number;
    xp: number;
    stats: {
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
    actions?: MonsterAction[];
    traits?: MonsterAction[];
    legendary_actions?: MonsterAction[];
    reactions?: MonsterAction[];
    raw_source_ref?: string;
    cr_formula_hint?: string;
}

export type MonsterAction = {
    name: string;
    damage?: string; // e.g., "2d6+3"
    [key: string]: unknown; // for any other fields
};

export type MonsterJSON = Record<string, MonsterBase>;
