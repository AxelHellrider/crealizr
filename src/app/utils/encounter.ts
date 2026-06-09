// utils/encounter.ts

export type Difficulty = "easy" | "medium" | "hard" | "deadly";
export type Ruleset = "2014" | "2024";
export type BudgetMode = "encounter" | "daily";

export const XP_THRESHOLDS = {
    "2014": {
        1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
        2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
        3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
        4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
        5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
        6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
        7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
        8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
        9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
        10:{ easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
        11:{ easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
        12:{ easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
        13:{ easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
        14:{ easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
        15:{ easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
        16:{ easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
        17:{ easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
        18:{ easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
        19:{ easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
        20:{ easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
    },
    "2024": {
        1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
        2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
        3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
        4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
        5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
        6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
        7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
        8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
        9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
        10:{ easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
        11:{ easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
        12:{ easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
        13:{ easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
        14:{ easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
        15:{ easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
        16:{ easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
        17:{ easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
        18:{ easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
        19:{ easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
        20:{ easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
    },
};

export const XP_PER_CR: Record<Ruleset, Record<string, number>> = {
    "2014": {
        "0": 10, "0.125": 25, "0.25": 50, "0.5": 100,
        "1": 200, "2": 450, "3": 700, "4": 1100,
        "5": 1800, "6": 2300, "7": 2900, "8": 3900,
        "9": 5000, "10": 5900, "11": 7200, "12": 8400,
        "13": 10000, "14": 11500, "15": 13000,
        "16": 15000, "17": 18000, "18": 20000,
        "19": 22000, "20": 25000, "21": 33000,
        "22": 41000, "23": 50000, "24": 62000,
        "25": 75000, "26": 90000, "27": 105000,
        "28": 120000, "29": 135000, "30": 155000,
    },
    "2024": {
        "0": 10, "0.125": 25, "0.25": 50, "0.5": 100,
        "1": 200, "2": 450, "3": 700, "4": 1100,
        "5": 1800, "6": 2300, "7": 2900, "8": 3900,
        "9": 5000, "10": 5900, "11": 7200, "12": 8400,
        "13": 10000, "14": 11500, "15": 13000,
        "16": 15000, "17": 18000, "18": 20000,
        "19": 22000, "20": 25000, "21": 33000,
        "22": 41000, "23": 50000, "24": 62000,
        "25": 75000, "26": 90000, "27": 105000,
        "28": 120000, "29": 135000, "30": 155000,
    },
};

export function encounterMultiplier(count: number) {
    if (count <= 1) return 1;
    if (count === 2) return 1.5;
    if (count <= 6) return 2;
    if (count <= 10) return 2.5;
    if (count <= 14) return 3;
    return 4;
}

export function partyBudget(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    mode: BudgetMode;
}) {
    const rulesetKey = opts.ruleset === "2024" ? "2024" : "2014";
    const rulesetData = XP_THRESHOLDS[rulesetKey];
    const lvl = Math.min(20, Math.max(1, opts.level)) as keyof typeof rulesetData;
    const levels = rulesetData[lvl] || XP_THRESHOLDS["2014"][1];
    const base = levels[opts.difficulty] || 0;
    const encounter = base * opts.size;
    return opts.mode === "daily" ? Math.round(encounter * 3.4) : encounter;
}

export type EncounterSuggestion = {
    cr: number;
    count: number;
    xpEach: number;
    adjustedXP: number;
    fit: number;
};

export type MonsterRecommendationMember = {
    name: string;
    count: number;
    cr: number;
    xpEach: number;
    benchmarkCr: number;
    crDelta: number;
    matchQuality: "exact" | "nearest";
};

export type MonsterRecommendation = {
    formation: "solo" | "group";
    members: MonsterRecommendationMember[];
    totalCount: number;
    adjustedXP: number;
    fit: number;
};

export type Terrain = "dungeon" | "wilderness" | "urban" | "underwater" | "planar" | "any";
export type Affiliation = "humanoid" | "beast" | "undead" | "construct" | "dragon" | "fiend" | "celestial" | "fey" | "monstrosity" | "giant" | "elemental" | "aberration" | "plant" | "any";

type MonsterManualCatalogEntry = {
    name: string;
    cr: number;
    terrain: Terrain[];
    affiliation: Affiliation;
    genus?: string;
};

export const MONSTER_MANUAL_2014_CATALOG: readonly MonsterManualCatalogEntry[] = [
    { name: "Commoner", cr: 0, terrain: ["urban"], affiliation: "humanoid", genus: "human" },
    { name: "Crawling claw", cr: 0, terrain: ["dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Giant fire beetle", cr: 0, terrain: ["dungeon", "wilderness"], affiliation: "beast", genus: "beetle" },
    { name: "Bandit", cr: 0.125, terrain: ["urban", "wilderness"], affiliation: "humanoid", genus: "human" },
    { name: "Cultist", cr: 0.125, terrain: ["dungeon", "urban"], affiliation: "humanoid", genus: "human" },
    { name: "Kobold", cr: 0.125, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "kobold" },
    { name: "Stirge", cr: 0.125, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "stirge" },
    { name: "Tribal warrior", cr: 0.125, terrain: ["wilderness"], affiliation: "humanoid", genus: "human" },
    { name: "Acolyte", cr: 0.25, terrain: ["urban", "dungeon"], affiliation: "humanoid", genus: "human" },
    { name: "Goblin", cr: 0.25, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "goblinoid" },
    { name: "Skeleton", cr: 0.25, terrain: ["any"], affiliation: "undead", genus: "undead" },
    { name: "Wolf", cr: 0.25, terrain: ["wilderness"], affiliation: "beast", genus: "canine" },
    { name: "Zombie", cr: 0.25, terrain: ["any"], affiliation: "undead", genus: "undead" },
    { name: "Black bear", cr: 0.5, terrain: ["wilderness"], affiliation: "beast", genus: "bear" },
    { name: "Gnoll", cr: 0.5, terrain: ["wilderness", "dungeon"], affiliation: "humanoid", genus: "gnoll" },
    { name: "Hobgoblin", cr: 0.5, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "goblinoid" },
    { name: "Orc", cr: 0.5, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "orc" },
    { name: "Rust monster", cr: 0.5, terrain: ["dungeon"], affiliation: "monstrosity", genus: "rust monster" },
    { name: "Shadow", cr: 0.5, terrain: ["dungeon", "urban"], affiliation: "undead", genus: "undead" },
    { name: "Animated armor", cr: 1, terrain: ["dungeon"], affiliation: "construct", genus: "construct" },
    { name: "Bugbear", cr: 1, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "goblinoid" },
    { name: "Dire wolf", cr: 1, terrain: ["wilderness"], affiliation: "beast", genus: "canine" },
    { name: "Dryad", cr: 1, terrain: ["wilderness"], affiliation: "fey", genus: "fey" },
    { name: "Ghoul", cr: 1, terrain: ["dungeon", "wilderness"], affiliation: "undead", genus: "undead" },
    { name: "Harpy", cr: 1, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "harpy" },
    { name: "Imp", cr: 1, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "devil" },
    { name: "Tiger", cr: 1, terrain: ["wilderness"], affiliation: "beast", genus: "feline" },
    { name: "Ankheg", cr: 2, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "ankheg" },
    { name: "Bandit captain", cr: 2, terrain: ["urban", "wilderness"], affiliation: "humanoid", genus: "human" },
    { name: "Berserker", cr: 2, terrain: ["wilderness", "dungeon"], affiliation: "humanoid", genus: "human" },
    { name: "Carrion crawler", cr: 2, terrain: ["dungeon"], affiliation: "monstrosity", genus: "carrion crawler" },
    { name: "Druid", cr: 2, terrain: ["wilderness"], affiliation: "humanoid", genus: "human" },
    { name: "Gargoyle", cr: 2, terrain: ["dungeon", "urban"], affiliation: "construct", genus: "construct" },
    { name: "Gelatinous cube", cr: 2, terrain: ["dungeon"], affiliation: "monstrosity", genus: "ooze" },
    { name: "Ghast", cr: 2, terrain: ["dungeon", "wilderness"], affiliation: "undead", genus: "undead" },
    { name: "Ogre", cr: 2, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "ogre" },
    { name: "Wererat", cr: 2, terrain: ["urban", "dungeon"], affiliation: "humanoid", genus: "human" },
    { name: "Will-o'-wisp", cr: 2, terrain: ["wilderness", "dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Basilisk", cr: 3, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "basilisk" },
    { name: "Displacer beast", cr: 3, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "displacer beast" },
    { name: "Doppelganger", cr: 3, terrain: ["urban", "dungeon"], affiliation: "monstrosity", genus: "doppelganger" },
    { name: "Green hag", cr: 3, terrain: ["wilderness"], affiliation: "fey", genus: "hag" },
    { name: "Hell hound", cr: 3, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "hell hound" },
    { name: "Manticore", cr: 3, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "manticore" },
    { name: "Minotaur", cr: 3, terrain: ["dungeon"], affiliation: "monstrosity", genus: "minotaur" },
    { name: "Mummy", cr: 3, terrain: ["dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Owlbear", cr: 3, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "owlbear" },
    { name: "Werewolf", cr: 3, terrain: ["wilderness", "urban"], affiliation: "humanoid", genus: "human" },
    { name: "Yeti", cr: 3, terrain: ["wilderness"], affiliation: "monstrosity", genus: "yeti" },
    { name: "Banshee", cr: 4, terrain: ["wilderness", "dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Black pudding", cr: 4, terrain: ["dungeon"], affiliation: "monstrosity", genus: "ooze" },
    { name: "Chuul", cr: 4, terrain: ["underwater", "dungeon"], affiliation: "monstrosity", genus: "chuul" },
    { name: "Couatl", cr: 4, terrain: ["planar", "wilderness"], affiliation: "celestial", genus: "couatl" },
    { name: "Ettin", cr: 4, terrain: ["wilderness", "dungeon"], affiliation: "giant", genus: "giant" },
    { name: "Ghost", cr: 4, terrain: ["dungeon", "urban"], affiliation: "undead", genus: "undead" },
    { name: "Helmed horror", cr: 4, terrain: ["dungeon"], affiliation: "construct", genus: "construct" },
    { name: "Succubus", cr: 4, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "devil" },
    { name: "Air elemental", cr: 5, terrain: ["planar", "wilderness"], affiliation: "elemental", genus: "elemental" },
    { name: "Barbed devil", cr: 5, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "devil" },
    { name: "Bulette", cr: 5, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "bulette" },
    { name: "Cambion", cr: 5, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "devil" },
    { name: "Flesh golem", cr: 5, terrain: ["dungeon"], affiliation: "construct", genus: "construct" },
    { name: "Gladiator", cr: 5, terrain: ["urban"], affiliation: "humanoid", genus: "human" },
    { name: "Hill giant", cr: 5, terrain: ["wilderness", "dungeon"], affiliation: "giant", genus: "giant" },
    { name: "Roper", cr: 5, terrain: ["dungeon"], affiliation: "monstrosity", genus: "roper" },
    { name: "Shambling mound", cr: 5, terrain: ["wilderness", "dungeon"], affiliation: "plant", genus: "plant" },
    { name: "Troll", cr: 5, terrain: ["wilderness", "dungeon"], affiliation: "giant", genus: "troll" },
    { name: "Vampire spawn", cr: 5, terrain: ["urban", "dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Wraith", cr: 5, terrain: ["dungeon", "urban"], affiliation: "undead", genus: "undead" },
    { name: "Chimera", cr: 6, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "chimera" },
    { name: "Cyclops", cr: 6, terrain: ["wilderness", "dungeon"], affiliation: "giant", genus: "giant" },
    { name: "Drider", cr: 6, terrain: ["dungeon"], affiliation: "monstrosity", genus: "drider" },
    { name: "Invisible stalker", cr: 6, terrain: ["planar", "wilderness"], affiliation: "elemental", genus: "elemental" },
    { name: "Mage", cr: 6, terrain: ["urban", "dungeon"], affiliation: "humanoid", genus: "human" },
    { name: "Mammoth", cr: 6, terrain: ["wilderness"], affiliation: "beast", genus: "mammoth" },
    { name: "Medusa", cr: 6, terrain: ["dungeon", "wilderness"], affiliation: "monstrosity", genus: "medusa" },
    { name: "Wyvern", cr: 6, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "wyvern" },
    { name: "Mind flayer", cr: 7, terrain: ["dungeon", "underwater"], affiliation: "aberration", genus: "mind flayer" },
    { name: "Oni", cr: 7, terrain: ["planar", "wilderness"], affiliation: "giant", genus: "oni" },
    { name: "Shield guardian", cr: 7, terrain: ["dungeon"], affiliation: "construct", genus: "construct" },
    { name: "Stone giant", cr: 7, terrain: ["wilderness", "dungeon"], affiliation: "giant", genus: "giant" },
    { name: "Young black dragon", cr: 7, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Assassin", cr: 8, terrain: ["urban"], affiliation: "humanoid", genus: "human" },
    { name: "Chain devil", cr: 8, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "devil" },
    { name: "Frost giant", cr: 8, terrain: ["wilderness", "dungeon"], affiliation: "giant", genus: "giant" },
    { name: "Hydra", cr: 8, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "hydra" },
    { name: "Spirit naga", cr: 8, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "naga" },
    { name: "Tyrannosaurus rex", cr: 8, terrain: ["wilderness"], affiliation: "beast", genus: "dinosaur" },
    { name: "Young green dragon", cr: 8, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Bone devil", cr: 9, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "devil" },
    { name: "Clay golem", cr: 9, terrain: ["dungeon"], affiliation: "construct", genus: "construct" },
    { name: "Cloud giant", cr: 9, terrain: ["wilderness", "dungeon"], affiliation: "giant", genus: "giant" },
    { name: "Fire giant", cr: 9, terrain: ["wilderness", "dungeon"], affiliation: "giant", genus: "giant" },
    { name: "Treant", cr: 9, terrain: ["wilderness"], affiliation: "plant", genus: "plant" },
    { name: "Young blue dragon", cr: 9, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Aboleth", cr: 10, terrain: ["underwater", "dungeon"], affiliation: "aberration", genus: "aboleth" },
    { name: "Deva", cr: 10, terrain: ["planar"], affiliation: "celestial", genus: "celestial" },
    { name: "Stone golem", cr: 10, terrain: ["dungeon"], affiliation: "construct", genus: "construct" },
    { name: "Young red dragon", cr: 10, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Behir", cr: 11, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "behir" },
    { name: "Djinni", cr: 11, terrain: ["planar", "wilderness"], affiliation: "elemental", genus: "genie" },
    { name: "Efreeti", cr: 11, terrain: ["planar", "wilderness"], affiliation: "elemental", genus: "genie" },
    { name: "Horned devil", cr: 11, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "devil" },
    { name: "Remorhaz", cr: 11, terrain: ["wilderness", "planar"], affiliation: "monstrosity", genus: "remorhaz" },
    { name: "Roc", cr: 11, terrain: ["wilderness"], affiliation: "beast", genus: "roc" },
    { name: "Archmage", cr: 12, terrain: ["urban", "dungeon"], affiliation: "humanoid", genus: "human" },
    { name: "Erinyes", cr: 12, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "devil" },
    { name: "Adult white dragon", cr: 13, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Beholder (not in lair)", cr: 13, terrain: ["dungeon", "underwater"], affiliation: "aberration", genus: "beholder" },
    { name: "Rakshasa", cr: 13, terrain: ["urban", "dungeon"], affiliation: "fiend", genus: "rakshasa" },
    { name: "Storm giant", cr: 13, terrain: ["wilderness", "dungeon"], affiliation: "giant", genus: "giant" },
    { name: "Vampire", cr: 13, terrain: ["urban", "dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Adult black dragon", cr: 14, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Beholder (in lair)", cr: 14, terrain: ["dungeon", "underwater"], affiliation: "aberration", genus: "beholder" },
    { name: "Death tyrant (not in lair)", cr: 14, terrain: ["dungeon", "underwater"], affiliation: "undead", genus: "undead" },
    { name: "Ice devil", cr: 14, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "devil" },
    { name: "Adult green dragon", cr: 15, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Purple worm", cr: 15, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "purple worm" },
    { name: "Vampire (spellcaster)", cr: 15, terrain: ["urban", "dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Adult blue dragon", cr: 16, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Iron golem", cr: 16, terrain: ["dungeon"], affiliation: "construct", genus: "construct" },
    { name: "Marilith", cr: 16, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "demon" },
    { name: "Planetar", cr: 16, terrain: ["planar"], affiliation: "celestial", genus: "celestial" },
    { name: "Adult red dragon", cr: 17, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Death knight", cr: 17, terrain: ["dungeon", "wilderness"], affiliation: "undead", genus: "undead" },
    { name: "Dragon turtle", cr: 17, terrain: ["underwater", "wilderness"], affiliation: "dragon", genus: "dragon" },
    { name: "Goristro", cr: 17, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "demon" },
    { name: "Demilich (not in lair)", cr: 18, terrain: ["dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Balor", cr: 19, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "demon" },
    { name: "Ancient white dragon", cr: 20, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Pit fiend", cr: 20, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "devil" },
    { name: "Ancient black dragon", cr: 21, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Lich (not in lair)", cr: 21, terrain: ["dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Solar", cr: 21, terrain: ["planar"], affiliation: "celestial", genus: "celestial" },
    { name: "Ancient green dragon", cr: 22, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Lich (in lair)", cr: 22, terrain: ["dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Empyrean", cr: 23, terrain: ["planar"], affiliation: "celestial", genus: "celestial" },
    { name: "Kraken", cr: 23, terrain: ["underwater"], affiliation: "monstrosity", genus: "kraken" },
    { name: "Ancient gold dragon", cr: 24, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Ancient red dragon", cr: 24, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Tarrasque", cr: 30, terrain: ["wilderness"], affiliation: "monstrosity", genus: "tarrasque" },
];

export const MONSTER_MANUAL_2024_CATALOG: readonly MonsterManualCatalogEntry[] = [
    { name: "Commoner", cr: 0, terrain: ["urban"], affiliation: "humanoid", genus: "human" },
    { name: "Crawling claw", cr: 0, terrain: ["dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Giant fire beetle", cr: 0, terrain: ["dungeon", "wilderness"], affiliation: "beast", genus: "beetle" },
    { name: "Bandit", cr: 0.125, terrain: ["urban", "wilderness"], affiliation: "humanoid", genus: "human" },
    { name: "Cultist", cr: 0.125, terrain: ["dungeon", "urban"], affiliation: "humanoid", genus: "human" },
    { name: "Kobold", cr: 0.125, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "kobold" },
    { name: "Stirge", cr: 0.125, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "stirge" },
    { name: "Tribal warrior", cr: 0.125, terrain: ["wilderness"], affiliation: "humanoid", genus: "human" },
    { name: "Acolyte", cr: 0.25, terrain: ["urban", "dungeon"], affiliation: "humanoid", genus: "human" },
    { name: "Goblin", cr: 0.25, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "goblinoid" },
    { name: "Skeleton", cr: 0.25, terrain: ["any"], affiliation: "undead", genus: "undead" },
    { name: "Wolf", cr: 0.25, terrain: ["wilderness"], affiliation: "beast", genus: "canine" },
    { name: "Zombie", cr: 0.25, terrain: ["any"], affiliation: "undead", genus: "undead" },
    { name: "Black bear", cr: 0.5, terrain: ["wilderness"], affiliation: "beast", genus: "bear" },
    { name: "Gnoll", cr: 0.5, terrain: ["wilderness", "dungeon"], affiliation: "humanoid", genus: "gnoll" },
    { name: "Hobgoblin", cr: 0.5, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "goblinoid" },
    { name: "Orc", cr: 0.5, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "orc" },
    { name: "Rust monster", cr: 0.5, terrain: ["dungeon"], affiliation: "monstrosity", genus: "rust monster" },
    { name: "Shadow", cr: 0.5, terrain: ["dungeon", "urban"], affiliation: "undead", genus: "undead" },
    { name: "Animated armor", cr: 1, terrain: ["dungeon"], affiliation: "construct", genus: "construct" },
    { name: "Bugbear", cr: 1, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "goblinoid" },
    { name: "Dire wolf", cr: 1, terrain: ["wilderness"], affiliation: "beast", genus: "canine" },
    { name: "Dryad", cr: 1, terrain: ["wilderness"], affiliation: "fey", genus: "fey" },
    { name: "Ghoul", cr: 1, terrain: ["dungeon", "wilderness"], affiliation: "undead", genus: "undead" },
    { name: "Harpy", cr: 1, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "harpy" },
    { name: "Imp", cr: 1, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "devil" },
    { name: "Tiger", cr: 1, terrain: ["wilderness"], affiliation: "beast", genus: "feline" },
    { name: "Ankheg", cr: 2, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "ankheg" },
    { name: "Bandit captain", cr: 2, terrain: ["urban", "wilderness"], affiliation: "humanoid", genus: "human" },
    { name: "Berserker", cr: 2, terrain: ["wilderness", "dungeon"], affiliation: "humanoid", genus: "human" },
    { name: "Carrion crawler", cr: 2, terrain: ["dungeon"], affiliation: "monstrosity", genus: "carrion crawler" },
    { name: "Druid", cr: 2, terrain: ["wilderness"], affiliation: "humanoid", genus: "human" },
    { name: "Gargoyle", cr: 2, terrain: ["dungeon", "urban"], affiliation: "construct", genus: "construct" },
    { name: "Gelatinous cube", cr: 2, terrain: ["dungeon"], affiliation: "monstrosity", genus: "ooze" },
    { name: "Ghast", cr: 2, terrain: ["dungeon", "wilderness"], affiliation: "undead", genus: "undead" },
    { name: "Ogre", cr: 2, terrain: ["dungeon", "wilderness"], affiliation: "humanoid", genus: "ogre" },
    { name: "Wererat", cr: 2, terrain: ["urban", "dungeon"], affiliation: "humanoid", genus: "human" },
    { name: "Will-o'-wisp", cr: 2, terrain: ["wilderness", "dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Basilisk", cr: 3, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "basilisk" },
    { name: "Displacer beast", cr: 3, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "displacer beast" },
    { name: "Doppelganger", cr: 3, terrain: ["urban", "dungeon"], affiliation: "monstrosity", genus: "doppelganger" },
    { name: "Green hag", cr: 3, terrain: ["wilderness"], affiliation: "fey", genus: "hag" },
    { name: "Hell hound", cr: 3, terrain: ["planar", "dungeon"], affiliation: "fiend", genus: "hell hound" },
    { name: "Manticore", cr: 3, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "manticore" },
    { name: "Minotaur", cr: 3, terrain: ["dungeon"], affiliation: "monstrosity", genus: "minotaur" },
    { name: "Mummy", cr: 3, terrain: ["dungeon"], affiliation: "undead", genus: "undead" },
    { name: "Owlbear", cr: 3, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "owlbear" },
    { name: "Phase spider", cr: 3, terrain: ["dungeon", "planar"], affiliation: "monstrosity", genus: "spider" },
    { name: "Pteranodon", cr: 3, terrain: ["wilderness"], affiliation: "beast", genus: "dinosaur" },
    { name: "Scorpion", cr: 3, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "scorpion" },
    { name: "Vampire spawn", cr: 3, terrain: ["dungeon", "urban"], affiliation: "undead", genus: "vampire" },
    { name: "Wight", cr: 3, terrain: ["dungeon", "wilderness"], affiliation: "undead", genus: "undead" },
    { name: "Yeti", cr: 3, terrain: ["wilderness"], affiliation: "monstrosity", genus: "yeti" },
    { name: "Bulette", cr: 5, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "bulette" },
    { name: "Chimera", cr: 6, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "chimera" },
    { name: "Cockatrice", cr: 3, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "cockatrice" },
    { name: "Ettercap", cr: 2, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "ettercap" },
    { name: "Giant spider", cr: 1, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "spider" },
    { name: "Giant toad", cr: 1, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "toad" },
    { name: "Grick", cr: 2, terrain: ["dungeon"], affiliation: "monstrosity", genus: "grick" },
    { name: "Hook horror", cr: 3, terrain: ["dungeon"], affiliation: "monstrosity", genus: "hook horror" },
    { name: "Lycanthrope", cr: 3, terrain: ["wilderness", "urban"], affiliation: "humanoid", genus: "human" },
    { name: "Medusa", cr: 4, terrain: ["dungeon", "wilderness"], affiliation: "monstrosity", genus: "medusa" },
    { name: "Otyugh", cr: 5, terrain: ["dungeon"], affiliation: "monstrosity", genus: "otyugh" },
    { name: "Pegasus", cr: 2, terrain: ["wilderness"], affiliation: "celestial", genus: "pegasus" },
    { name: "Roper", cr: 5, terrain: ["dungeon"], affiliation: "monstrosity", genus: "roper" },
    { name: "Spectator", cr: 3, terrain: ["dungeon", "planar"], affiliation: "aberration", genus: "spectator" },
    { name: "Troll", cr: 5, terrain: ["wilderness", "dungeon"], affiliation: "giant", genus: "troll" },
    { name: "Worg", cr: 2, terrain: ["wilderness"], affiliation: "beast", genus: "canine" },
    { name: "Wyvern", cr: 6, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Young black dragon", cr: 7, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Young blue dragon", cr: 7, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Young green dragon", cr: 7, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Young red dragon", cr: 7, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Young white dragon", cr: 7, terrain: ["wilderness", "dungeon"], affiliation: "dragon", genus: "dragon" },
    { name: "Air elemental", cr: 5, terrain: ["planar", "wilderness"], affiliation: "elemental", genus: "elemental" },
    { name: "Earth elemental", cr: 5, terrain: ["planar", "dungeon"], affiliation: "elemental", genus: "elemental" },
    { name: "Fire elemental", cr: 5, terrain: ["planar", "dungeon"], affiliation: "elemental", genus: "elemental" },
    { name: "Water elemental", cr: 5, terrain: ["planar", "underwater"], affiliation: "elemental", genus: "elemental" },
    { name: "Azer", cr: 5, terrain: ["planar", "dungeon"], affiliation: "elemental", genus: "azer" },
    { name: "Deva", cr: 10, terrain: ["planar"], affiliation: "celestial", genus: "celestial" },
    { name: "Giant eagle", cr: 1, terrain: ["wilderness"], affiliation: "beast", genus: "eagle" },
    { name: "Giant elk", cr: 2, terrain: ["wilderness"], affiliation: "beast", genus: "elk" },
    { name: "Giant hyena", cr: 1, terrain: ["wilderness"], affiliation: "beast", genus: "hyena" },
    { name: "Giant octopus", cr: 1, terrain: ["underwater"], affiliation: "beast", genus: "octopus" },
    { name: "Giant rat", cr: 0.125, terrain: ["dungeon", "urban"], affiliation: "beast", genus: "rat" },
    { name: "Giant shark", cr: 4, terrain: ["underwater"], affiliation: "beast", genus: "shark" },
    { name: "Giant spider", cr: 1, terrain: ["wilderness", "dungeon"], affiliation: "monstrosity", genus: "spider" },
    { name: "Giant toad", cr: 1, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "toad" },
    { name: "Giant vulture", cr: 1, terrain: ["wilderness"], affiliation: "beast", genus: "vulture" },
    { name: "Giant wolf spider", cr: 0.25, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "spider" },
    { name: "Giant constrictor snake", cr: 2, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "snake" },
    { name: "Giant poisonous snake", cr: 0.5, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "snake" },
    { name: "Giant boar", cr: 2, terrain: ["wilderness"], affiliation: "beast", genus: "boar" },
    { name: "Giant badger", cr: 0.125, terrain: ["wilderness"], affiliation: "beast", genus: "badger" },
    { name: "Giant bat", cr: 0.125, terrain: ["dungeon", "wilderness"], affiliation: "beast", genus: "bat" },
    { name: "Giant centipede", cr: 0.25, terrain: ["dungeon", "wilderness"], affiliation: "beast", genus: "centipede" },
    { name: "Giant frog", cr: 0.25, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "frog" },
    { name: "Giant crab", cr: 0.25, terrain: ["underwater", "wilderness"], affiliation: "beast", genus: "crab" },
    { name: "Giant lizard", cr: 0.25, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "lizard" },
    { name: "Giant scorpion", cr: 3, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "scorpion" },
    { name: "Giant wasp", cr: 0.5, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "wasp" },
    { name: "Giant weasel", cr: 0.125, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "weasel" },
    { name: "Giant bombardier beetle", cr: 0.125, terrain: ["dungeon", "wilderness"], affiliation: "beast", genus: "beetle" },
    { name: "Giant fire beetle", cr: 0, terrain: ["dungeon", "wilderness"], affiliation: "beast", genus: "beetle" },
    { name: "Giant soldier ant", cr: 0.25, terrain: ["dungeon", "wilderness"], affiliation: "beast", genus: "ant" },
    { name: "Giant queen ant", cr: 4, terrain: ["dungeon", "wilderness"], affiliation: "beast", genus: "ant" },
    { name: "Giant worker ant", cr: 0.125, terrain: ["dungeon", "wilderness"], affiliation: "beast", genus: "ant" },
    { name: "Giant brain", cr: 8, terrain: ["dungeon", "planar"], affiliation: "aberration", genus: "brain" },
    { name: "Giant crayfish", cr: 2, terrain: ["underwater", "dungeon"], affiliation: "beast", genus: "crayfish" },
    { name: "Giant leech", cr: 0.5, terrain: ["underwater", "dungeon"], affiliation: "beast", genus: "leech" },
    { name: "Giant sea horse", cr: 0.125, terrain: ["underwater"], affiliation: "beast", genus: "sea horse" },
    { name: "Giant snapping turtle", cr: 3, terrain: ["underwater", "wilderness"], affiliation: "beast", genus: "turtle" },
    { name: "Giant strider", cr: 2, terrain: ["wilderness", "dungeon"], affiliation: "beast", genus: "strider" },
    { name: "Giant water beetle", cr: 0.25, terrain: ["underwater", "wilderness"], affiliation: "beast", genus: "beetle" },
];

function pickMonsterManualBenchmark(cr: number, seed: number, ruleset: Ruleset = "2014") {
    const catalog = ruleset === "2024" ? MONSTER_MANUAL_2024_CATALOG : MONSTER_MANUAL_2014_CATALOG;
    const exactMatches = catalog.filter((monster) => monster.cr === cr);
    if (exactMatches.length > 0) {
        return exactMatches[Math.abs(seed) % exactMatches.length];
    }

    return catalog.reduce((best, monster) => {
        const bestDelta = Math.abs(best.cr - cr);
        const currentDelta = Math.abs(monster.cr - cr);
        return currentDelta < bestDelta ? monster : best;
    });
}

export function suggestEncounters(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    budget: number;
}): EncounterSuggestion[] {
    const rulesetXP = XP_PER_CR[opts.ruleset] || XP_PER_CR["2014"];
    const crs = Object.keys(rulesetXP).map(Number);
    const results: EncounterSuggestion[] = [];

    for (const cr of crs) {
        const xpEach = rulesetXP[String(cr)];
        for (let n = 1; n <= 8; n++) {
            const adj = Math.round(xpEach * n * encounterMultiplier(n));
            const fit = Math.min(opts.budget, adj) / Math.max(opts.budget, adj);
            if (fit >= 0.7) {
                results.push({ cr, count: n, xpEach, adjustedXP: adj, fit });
            }
        }
    }

    return results
        .sort((a, b) => (b.fit - a.fit) || (a.adjustedXP - b.adjustedXP))
        .slice(0, 12);
}

export function recommendMonstersForParty(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    budget: number;
    formation?: "solo" | "group";
    maxTypes?: number;
    includeMinions?: boolean;
    relationCriteria?: "terrain" | "affiliation" | "genus" | "any";
    limit?: number;
}): MonsterRecommendation[] {
    const seed = opts.level * 31 + opts.size * 7;
    const seen = new Set<string>();
    const limit = Math.min(8, Math.max(1, opts.limit ?? 6));
    const formation = opts.formation ?? "solo";

    const toMember = (member: GroupMember, seedOffset: number): MonsterRecommendationMember => {
        const monster = pickMonsterManualBenchmark(member.cr, seed + seedOffset, opts.ruleset);
        return {
            name: monster.name,
            count: member.count,
            cr: member.cr,
            xpEach: member.xpEach,
            benchmarkCr: monster.cr,
            crDelta: Math.abs(monster.cr - member.cr),
            matchQuality: monster.cr === member.cr ? "exact" : "nearest",
        };
    };

    if (formation === "group") {
        return suggestGroupEncounters({
            ...opts,
            maxTypes: opts.maxTypes,
            relationCriteria: opts.relationCriteria,
        }).reduce<MonsterRecommendation[]>((recommendations, suggestion, index) => {
            if (recommendations.length >= limit) return recommendations;

            const members = suggestion.members.map((member, memberIndex) =>
                toMember(member, index * 11 + memberIndex)
            );
            const key = members.map((member) => `${member.count}x${member.name}`).join("|");
            if (seen.has(key)) return recommendations;

            seen.add(key);
            recommendations.push({
                formation: "group",
                members,
                totalCount: suggestion.totalCount,
                adjustedXP: suggestion.adjustedXP,
                fit: suggestion.fit,
            });

            return recommendations;
        }, []);
    }

    return suggestBossWithMinions({
        ...opts,
        includeMinions: opts.includeMinions ?? false,
        relationCriteria: opts.relationCriteria,
    }).reduce<MonsterRecommendation[]>((recommendations, suggestion, index) => {
        if (recommendations.length >= limit) return recommendations;

        const bossGroupMember: GroupMember = { cr: suggestion.boss.cr, count: suggestion.boss.count, xpEach: suggestion.boss.xpEach };
        const bossMember = toMember(bossGroupMember, index * 11);

        const minionMembers = suggestion.minions.map((minion, minionIndex) =>
            toMember(minion, index * 11 + minionIndex + 1)
        );

        const members = [bossMember, ...minionMembers];
        const key = members.map((m) => `${m.count}x${m.name}`).join("|");
        if (seen.has(key)) return recommendations;

        seen.add(key);
        recommendations.push({
            formation: "solo",
            members,
            totalCount: suggestion.totalCount,
            adjustedXP: suggestion.adjustedXP,
            fit: suggestion.fit,
        });

        return recommendations;
    }, []);
}

export type GroupMember = { cr: number; count: number; xpEach: number };
export type GroupSuggestion = {
    members: GroupMember[];
    totalCount: number;
    adjustedXP: number;
    fit: number;
};

export type BossMinionSuggestion = {
    boss: GroupMember;
    minions: GroupMember[];
    totalCount: number;
    adjustedXP: number;
    fit: number;
};

export function getRelatedMonsters(
    baseMonster: MonsterManualCatalogEntry,
    criteria: "terrain" | "affiliation" | "genus" | "any",
    ruleset: Ruleset = "2014"
): MonsterManualCatalogEntry[] {
    const catalog = ruleset === "2024" ? MONSTER_MANUAL_2024_CATALOG : MONSTER_MANUAL_2014_CATALOG;
    if (criteria === "any") {
        return catalog;
    }

    return catalog.filter((monster) => {
        if (criteria === "terrain") {
            return monster.terrain.some((t) => baseMonster.terrain.includes(t)) ||
                baseMonster.terrain.some((t) => monster.terrain.includes(t)) ||
                monster.terrain.includes("any") || baseMonster.terrain.includes("any");
        }
        if (criteria === "affiliation") {
            return monster.affiliation === baseMonster.affiliation ||
                monster.affiliation === "any" || baseMonster.affiliation === "any";
        }
        if (criteria === "genus") {
            return monster.genus === baseMonster.genus;
        }
        return false;
    });
}

export function suggestBossWithMinions(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    budget: number;
    includeMinions: boolean;
    relationCriteria?: "terrain" | "affiliation" | "genus" | "any";
}): BossMinionSuggestion[] {
    const rulesetXP = XP_PER_CR[opts.ruleset] || XP_PER_CR["2014"];
    const results: BossMinionSuggestion[] = [];

    // Find suitable boss CR (should be higher than party level, typically 2-4 levels higher)
    const bossCRs = Object.keys(rulesetXP)
        .map(Number)
        .filter((cr) => cr >= opts.level && cr <= opts.level + 4);

    for (const bossCR of bossCRs) {
        const bossXP = rulesetXP[String(bossCR)];
        const bossCount = 1;
        const bossAdjustedXP = Math.round(bossXP * encounterMultiplier(bossCount));

        if (!opts.includeMinions) {
            // Boss only
            const fit = Math.min(opts.budget, bossAdjustedXP) / Math.max(opts.budget, bossAdjustedXP);
            if (fit >= 0.7) {
                results.push({
                    boss: { cr: bossCR, count: bossCount, xpEach: bossXP },
                    minions: [],
                    totalCount: bossCount,
                    adjustedXP: bossAdjustedXP,
                    fit,
                });
            }
            continue;
        }

        // Boss + minions
        const remainingBudget = opts.budget - bossAdjustedXP * 0.6; // Boss takes 60% of budget
        if (remainingBudget <= 0) continue;

        const bossMonster = pickMonsterManualBenchmark(bossCR, opts.level * 31, opts.ruleset);
        const relatedMonsters = getRelatedMonsters(bossMonster, opts.relationCriteria || "any", opts.ruleset);

        // Find suitable minions (lower CR than boss)
        const minionCRs = relatedMonsters
            .map((m) => m.cr)
            .filter((cr) => cr < bossCR && cr >= 0)
            .filter((value, index, self) => self.indexOf(value) === index) // unique
            .sort((a, b) => a - b);

        for (const minionCR of minionCRs) {
            const minionXP = rulesetXP[String(minionCR)];
            for (let minionCount = 2; minionCount <= 8; minionCount++) {
                const minionTotalXP = minionXP * minionCount;
                const minionAdjustedXP = Math.round(minionTotalXP * encounterMultiplier(minionCount + 1));
                const totalAdjustedXP = bossAdjustedXP + minionAdjustedXP;
                const fit = Math.min(opts.budget, totalAdjustedXP) / Math.max(opts.budget, totalAdjustedXP);

                if (fit >= 0.7 && totalAdjustedXP <= opts.budget * 1.3) {
                    results.push({
                        boss: { cr: bossCR, count: bossCount, xpEach: bossXP },
                        minions: [{ cr: minionCR, count: minionCount, xpEach: minionXP }],
                        totalCount: bossCount + minionCount,
                        adjustedXP: totalAdjustedXP,
                        fit,
                    });
                }
            }
        }
    }

    return results
        .sort((a, b) => (b.fit - a.fit) || (b.totalCount - a.totalCount))
        .slice(0, 12);
}

export function suggestGroupEncounters(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    budget: number;
    maxTypes?: number;
    relationCriteria?: "terrain" | "affiliation" | "genus" | "any";
}): GroupSuggestion[] {
    const rulesetXP = XP_PER_CR[opts.ruleset] || XP_PER_CR["2014"];
    const crs = Object.entries(rulesetXP)
        .map(([cr, xp]) => ({ cr: Number(cr), xp }));

    const results: GroupSuggestion[] = [];
    const seen = new Set<string>();
    const maxTypes = Math.min(5, Math.max(2, opts.maxTypes ?? 2));
    const relationCriteria = opts.relationCriteria || "any";

    const buildCompositions = (total: number, parts: number, min: number = 1): number[][] => {
        if (parts === 1) {
            return total >= min ? [[total]] : [];
        }
        const combos: number[][] = [];
        for (let i = min; i <= total - (parts - 1) * min; i += 1) {
            const tails = buildCompositions(total - i, parts - 1, min);
            tails.forEach((tail) => combos.push([i, ...tail]));
        }
        return combos;
    };

    const buildCombinations = <T>(arr: T[], size: number, start = 0, path: T[] = [], out: T[][] = []) => {
        if (path.length === size) {
            out.push([...path]);
            return out;
        }
        for (let i = start; i <= arr.length - (size - path.length); i += 1) {
            path.push(arr[i]);
            buildCombinations(arr, size, i + 1, path, out);
            path.pop();
        }
        return out;
    };

    for (let n = 2; n <= 8; n++) {
        const multiplier = encounterMultiplier(n);
        const targetPer = opts.budget / (multiplier * n);
        let candidates = [...crs]
            .sort((a, b) => Math.abs(a.xp - targetPer) - Math.abs(b.xp - targetPer))
            .slice(0, 12);

        // Filter candidates by relation criteria if not "any"
        if (relationCriteria !== "any") {
            const baseMonster = pickMonsterManualBenchmark(candidates[0].cr, opts.level * 31, opts.ruleset);
            const relatedMonsters = getRelatedMonsters(baseMonster, relationCriteria, opts.ruleset);
            const relatedCRs = new Set(relatedMonsters.map((m) => m.cr));
            candidates = candidates.filter((c) => relatedCRs.has(c.cr));
        }

        for (let typeCount = 2; typeCount <= Math.min(maxTypes, n, candidates.length); typeCount += 1) {
            const crCombos = buildCombinations(candidates, typeCount);
            const compositions = buildCompositions(n, typeCount);

            for (const combo of crCombos) {
                for (const counts of compositions) {
                    const members = combo.map((entry, idx) => ({
                        cr: entry.cr,
                        count: counts[idx],
                        xpEach: entry.xp,
                    }));

                    const key = members.map((m) => `${m.cr}x${m.count}`).join("|");
                    if (seen.has(key)) continue;

                    const totalXP = members.reduce((s, m) => s + m.count * m.xpEach, 0);
                    const adj = Math.round(totalXP * multiplier);
                    const fit = Math.min(opts.budget, adj) / Math.max(opts.budget, adj);

                    if (fit >= 0.7) {
                        seen.add(key);
                        results.push({ members, totalCount: n, adjustedXP: adj, fit });
                    }
                }
            }
        }
    }

    return results
        .sort((a, b) => (b.fit - a.fit) || (a.adjustedXP - b.adjustedXP))
        .slice(0, 12);
}