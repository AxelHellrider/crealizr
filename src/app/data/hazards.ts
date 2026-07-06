// data/hazards.ts
// Hazard presets sourced only from material the SRD actually licenses:
//   - "environment" entries come from the SRD's core Adventuring rules
//     (falling, suffocating, difficult terrain, obscurement, extreme
//     temperatures) — NOT the Dungeon Master's Guide's "Environmental
//     Hazards" table, which is DMG-exclusive content outside the SRD/OGL/ORC
//     license and isn't reproduced here.
//   - "spell" entries summarize the area-effect mechanics of classic SRD
//     spells (Grease, Web, Cloudkill, etc.) in original wording — not verbatim
//     spell-block text.
// aoeRadius matches the existing hex-radius scale used by the AoE picker in
// NodeEditorPopover (0 = single hex, 1 = ~7 hexes, 2 = ~19 hexes, 3 = ~37 hexes).

import type { HazardSource } from "@/app/types/encounterLayout";

export type HazardPreset = {
    id: string;
    name: string;
    source: HazardSource;
    description: string;
    aoeRadius: number;
};

export const ENVIRONMENTAL_HAZARDS: HazardPreset[] = [
    {
        id: "env-pit",
        name: "Pit / Falling Hazard",
        source: "environment",
        description: "A creature that falls into this hex takes 1d6 bludgeoning damage per 10 feet fallen, to a maximum of 20d6.",
        aoeRadius: 0,
    },
    {
        id: "env-deep-water",
        name: "Deep Water / Submersion",
        source: "environment",
        description: "A creature can hold its breath for a number of minutes equal to 1 + its Constitution modifier before risking suffocation.",
        aoeRadius: 0,
    },
    {
        id: "env-difficult-terrain",
        name: "Difficult Terrain",
        source: "environment",
        description: "Each foot of movement within this area costs 1 extra foot.",
        aoeRadius: 1,
    },
    {
        id: "env-heavy-obscurement",
        name: "Heavy Obscurement",
        source: "environment",
        description: "Creatures inside are effectively blinded while within (fog, thick foliage, darkness, etc.).",
        aoeRadius: 1,
    },
    {
        id: "env-extreme-cold",
        name: "Extreme Cold",
        source: "environment",
        description: "An exposed creature without sufficient protection must succeed on a DC 10 Constitution save each hour or gain one level of exhaustion.",
        aoeRadius: 2,
    },
    {
        id: "env-extreme-heat",
        name: "Extreme Heat",
        source: "environment",
        description: "Without enough water, an exposed creature must succeed on a DC 5 Constitution save each hour (disadvantage in heavy armor) or gain one level of exhaustion.",
        aoeRadius: 2,
    },
];

export const SPELL_HAZARDS: HazardPreset[] = [
    {
        id: "spell-grease",
        name: "Grease",
        source: "spell",
        description: "A 10-ft. square of slick ground. Each creature there must succeed on a Dexterity save or fall prone.",
        aoeRadius: 1,
    },
    {
        id: "spell-web",
        name: "Web",
        source: "spell",
        description: "A 20-ft. cube of sticky webbing. Creatures inside are restrained unless they succeed on a Strength save; the webbing is flammable.",
        aoeRadius: 2,
    },
    {
        id: "spell-spike-growth",
        name: "Spike Growth",
        source: "spell",
        description: "A 20-ft. radius of camouflaged spikes. Difficult terrain; creatures take 2d4 piercing damage for every 5 feet moved through it.",
        aoeRadius: 2,
    },
    {
        id: "spell-cloudkill",
        name: "Cloudkill",
        source: "spell",
        description: "A 20-ft. radius sphere of poison gas. Creatures take 5d8 poison damage (Constitution save for half); the area is heavily obscured.",
        aoeRadius: 2,
    },
    {
        id: "spell-stinking-cloud",
        name: "Stinking Cloud",
        source: "spell",
        description: "A 20-ft. radius sphere of nauseating gas. Creatures must succeed on a Constitution save or be incapacitated for the round.",
        aoeRadius: 2,
    },
    {
        id: "spell-wall-of-fire",
        name: "Wall of Fire",
        source: "spell",
        description: "A wall of flame. Creatures within 10 ft. of it take 5d8 fire damage (Dexterity save for half).",
        aoeRadius: 1,
    },
    {
        id: "spell-sleet-storm",
        name: "Sleet Storm",
        source: "spell",
        description: "A 20-ft. radius cylinder of slick ice and sleet. Difficult terrain; creatures must succeed on a Dexterity save or fall prone.",
        aoeRadius: 2,
    },
    {
        id: "spell-insect-plague",
        name: "Insect Plague",
        source: "spell",
        description: "A 20-ft. radius sphere of swarming insects. Creatures take 4d10 piercing damage (Constitution save for half); the area is lightly obscured.",
        aoeRadius: 2,
    },
];

export const HAZARD_PRESETS: HazardPreset[] = [...ENVIRONMENTAL_HAZARDS, ...SPELL_HAZARDS];

export function getHazardPresets(source: HazardSource): HazardPreset[] {
    return HAZARD_PRESETS.filter(h => h.source === source);
}

export function getHazardPreset(id: string): HazardPreset | undefined {
    return HAZARD_PRESETS.find(h => h.id === id);
}
