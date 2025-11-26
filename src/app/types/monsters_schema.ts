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
    actions?: Array<{ name: string; type: string; bonus?: number; damage?: string }>;
    traits?: Array<{ name: string; desc: string }>;
    legendary_actions?: Array<{ name: string; desc: string }>;
    reactions?: Array<{ name: string; desc: string }>;
    raw_source_ref?: string;
    cr_formula_hint?: string;
}

export type MonsterJSON = Record<string, MonsterBase>;
