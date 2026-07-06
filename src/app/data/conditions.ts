// data/conditions.ts
// The SRD's "Conditions" appendix — freely licensed (OGL/ORC), unlike the
// DMG's Environmental Hazards table. Condition names and mechanics are the
// same across the 2014 and 2024 SRDs with one notable exception: Exhaustion
// was reworked in 2024 from an escalating six-level penalty table to a flat
// cumulative -2 per level. Everything else here applies to both rulesets.

import type { Ruleset } from "@/engine/encounter";

export type ConditionId =
    | "blinded" | "charmed" | "deafened" | "exhaustion" | "frightened"
    | "grappled" | "incapacitated" | "invisible" | "paralyzed" | "petrified"
    | "poisoned" | "prone" | "restrained" | "stunned" | "unconscious";

export type ConditionDef = {
    id: ConditionId;
    name: string;
    abbr: string;
    description: string;
};

const SHARED: Record<Exclude<ConditionId, "exhaustion">, ConditionDef> = {
    blinded: {
        id: "blinded", name: "Blinded", abbr: "BLI",
        description: "Can't see; automatically fails sight-based checks. Attack rolls against it have advantage, its own attack rolls have disadvantage.",
    },
    charmed: {
        id: "charmed", name: "Charmed", abbr: "CHA",
        description: "Can't attack the charmer or target it with harmful abilities. The charmer has advantage on social checks against it.",
    },
    deafened: {
        id: "deafened", name: "Deafened", abbr: "DEA",
        description: "Can't hear; automatically fails hearing-based checks.",
    },
    frightened: {
        id: "frightened", name: "Frightened", abbr: "FRI",
        description: "Disadvantage on ability checks and attack rolls while the source of fear is in sight; can't willingly move closer to it.",
    },
    grappled: {
        id: "grappled", name: "Grappled", abbr: "GRA",
        description: "Speed becomes 0. Ends if the grappler is incapacitated or the target is removed from its reach.",
    },
    incapacitated: {
        id: "incapacitated", name: "Incapacitated", abbr: "INC",
        description: "Can't take actions or reactions.",
    },
    invisible: {
        id: "invisible", name: "Invisible", abbr: "INV",
        description: "Impossible to see without special sense; counts as heavily obscured. Attack rolls against it have disadvantage, its own attack rolls have advantage.",
    },
    paralyzed: {
        id: "paralyzed", name: "Paralyzed", abbr: "PAR",
        description: "Incapacitated and can't move or speak. Fails Strength/Dexterity saves; attacks against it have advantage, and hits within 5 ft. are critical hits.",
    },
    petrified: {
        id: "petrified", name: "Petrified", abbr: "PET",
        description: "Transformed to stone; incapacitated, can't move or speak, unaware of surroundings. Resistant to all damage, immune to poison/disease.",
    },
    poisoned: {
        id: "poisoned", name: "Poisoned", abbr: "POI",
        description: "Disadvantage on attack rolls and ability checks.",
    },
    prone: {
        id: "prone", name: "Prone", abbr: "PRO",
        description: "Can only crawl unless it stands up. Disadvantage on attack rolls; melee attacks against it have advantage, ranged attacks have disadvantage.",
    },
    restrained: {
        id: "restrained", name: "Restrained", abbr: "RES",
        description: "Speed becomes 0. Disadvantage on attack rolls and Dexterity saves; attack rolls against it have advantage.",
    },
    stunned: {
        id: "stunned", name: "Stunned", abbr: "STU",
        description: "Incapacitated, can't move, and can speak only falteringly. Fails Strength/Dexterity saves; attacks against it have advantage.",
    },
    unconscious: {
        id: "unconscious", name: "Unconscious", abbr: "UNC",
        description: "Incapacitated, can't move or speak, unaware of surroundings, drops what it's holding, falls prone. Fails Strength/Dexterity saves; attacks against it have advantage, and hits within 5 ft. are critical hits.",
    },
};

const EXHAUSTION_2014: ConditionDef = {
    id: "exhaustion", name: "Exhaustion", abbr: "EXH",
    description: "Six cumulative levels, each worsening the effect (disadvantage on checks, halved speed, disadvantage on attacks/saves, HP max halved, speed to 0, death) — gaining a level while already at level 6 is fatal.",
};

const EXHAUSTION_2024: ConditionDef = {
    id: "exhaustion", name: "Exhaustion", abbr: "EXH",
    description: "Up to ten cumulative levels. Each level gives a -2 penalty to D20 Tests and reduces speed by 5 ft. per level; reaching level 10 is fatal. A long rest removes one level.",
};

export const CONDITIONS_2014: ConditionDef[] = [...Object.values(SHARED), EXHAUSTION_2014]
    .sort((a, b) => a.name.localeCompare(b.name));

export const CONDITIONS_2024: ConditionDef[] = [...Object.values(SHARED), EXHAUSTION_2024]
    .sort((a, b) => a.name.localeCompare(b.name));

export function getConditions(ruleset: Ruleset): ConditionDef[] {
    return ruleset === "2024" ? CONDITIONS_2024 : CONDITIONS_2014;
}

export function getCondition(id: ConditionId, ruleset: Ruleset): ConditionDef | undefined {
    return getConditions(ruleset).find(c => c.id === id);
}
