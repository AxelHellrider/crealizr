// utils/travelEncounter.ts

export type Terrain = "Forest" | "Desert" | "Mountains" | "Plains" | "Swamp" | "Arctic" | "Coast" | "Underdark";

export type EncounterType = "combat" | "survival" | "social" | "hazard" | "benefit";

export interface EncounterOutcome {
  range: [number, number];
  description: string;
  type: EncounterType;
}

export const TRAVEL_ENCOUNTER_TABLES: Record<Terrain, EncounterOutcome[]> = {
  Forest: [
    { range: [1, 2], description: "A flock of seagulls (Wait, in a forest? Yes, lost and confused).", type: "social" },
    { range: [3, 10], description: "A patch of bioluminescent mushrooms that grant temporary resistance to poison.", type: "benefit" },
    { range: [11, 20], description: "An old hermit offering a cryptic prophecy for a piece of silver.", type: "social" },
    { range: [21, 35], description: "A fallen tree blocking the path, hiding a small cache of supplies.", type: "benefit" },
    { range: [36, 50], description: "A friendly woodcutter who shares rumors about a nearby cave.", type: "social" },
    { range: [51, 65], description: "A circle of standing stones that hums with ancient magic.", type: "benefit" },
    { range: [66, 80], description: "A hidden grove with clear, refreshing water that restores some health.", type: "benefit" },
    { range: [81, 95], description: "An abandoned campsite with a half-burned journal.", type: "social" },
    { range: [96, 110], description: "A majestic stag that leads the party to a shortcut, saving travel time.", type: "benefit" },
    { range: [111, 125], description: "A sudden heavy downpour that slows travel and obscures vision.", type: "survival" },
    { range: [126, 140], description: "Dense thickets that require a survival check to navigate without getting lost.", type: "survival" },
    { range: [141, 155], description: "A swarm of stinging insects that makes resting difficult.", type: "hazard" },
    { range: [156, 170], description: "A pack of wolves stalking the party from the shadows.", type: "combat" },
    { range: [171, 185], description: "A warband of orcs patrolling their territory.", type: "combat" },
    { range: [186, 200], description: "A pair of owlbears hunting for their next meal.", type: "combat" },
  ],
  Desert: [
    { range: [1, 15], description: "A mirage of a lush oasis that fades as you approach.", type: "hazard" },
    { range: [16, 30], description: "A group of nomadic traders looking for water.", type: "social" },
    { range: [31, 45], description: "An ancient, half-buried sphinx offering a riddle.", type: "social" },
    { range: [46, 60], description: "A dehydrated traveler pleading for help.", type: "social" },
    { range: [61, 75], description: "A hidden entrance to a forgotten tomb.", type: "benefit" },
    { range: [76, 90], description: "A patch of desert lilies with healing properties.", type: "benefit" },
    { range: [91, 110], description: "A blue dragon soaring high above, fortunately ignoring the party.", type: "social" },
    { range: [111, 130], description: "A sudden sandstorm reduces visibility to zero and risks exhaustion.", type: "survival" },
    { range: [131, 150], description: "Extreme heat during the day, requiring extra water consumption.", type: "survival" },
    { range: [151, 170], description: "A swarm of locusts stripping anything edible from the party's packs.", type: "hazard" },
    { range: [171, 185], description: "Giant scorpions emerging from the sand.", type: "combat" },
    { range: [186, 200], description: "A group of desert bandits ambushing at dusk.", type: "combat" },
  ],
  Mountains: [
    { range: [1, 15], description: "A lonely goat that seems to be following the party.", type: "social" },
    { range: [16, 30], description: "A group of dwarves mining a vein of rare ore.", type: "social" },
    { range: [31, 45], description: "A precarious rope bridge swaying in the wind.", type: "hazard" },
    { range: [46, 60], description: "An eagle carrying a shiny object in its talons.", type: "benefit" },
    { range: [61, 75], description: "A cave entrance exhaling warm, sulfurous air.", type: "social" },
    { range: [76, 90], description: "A frozen waterfall with something glimmering behind the ice.", type: "benefit" },
    { range: [91, 110], description: "A griffon nest perched on an inaccessible crag.", type: "social" },
    { range: [111, 130], description: "A sudden rockslide blocks the mountain pass.", type: "survival" },
    { range: [131, 150], description: "Thin air and steep climbs leading to potential exhaustion.", type: "survival" },
    { range: [151, 170], description: "A harpy's song echoing through the peaks, luring travelers to edges.", type: "combat" },
    { range: [171, 185], description: "A mountain giant sitting on a peak, throwing pebbles.", type: "combat" },
    { range: [186, 200], description: "A pack of crag cats hunting in the snow.", type: "combat" },
  ],
  Plains: [
    { range: [1, 15], description: "A vast herd of bison migrating across the plains.", type: "social" },
    { range: [16, 30], description: "A lone farmhouse with a friendly family.", type: "social" },
    { range: [31, 45], description: "A travelling circus with colorful wagons.", type: "social" },
    { range: [46, 60], description: "A circle of burnt grass where something landed.", type: "social" },
    { range: [61, 75], description: "A burial mound topped with wildflowers.", type: "benefit" },
    { range: [76, 90], description: "A wandering bard looking for new stories.", type: "social" },
    { range: [91, 110], description: "A massive thunderstorm with spectacular lightning.", type: "hazard" },
    { range: [111, 130], description: "A sudden wildfire spreading rapidly through the dry grass.", type: "survival" },
    { range: [131, 150], description: "Locating a clear stream with fresh, drinkable water.", type: "benefit" },
    { range: [151, 170], description: "A group of bandits hiding in the tall grass.", type: "combat" },
    { range: [171, 185], description: "A pack of gnolls scavenging a recent battlefield.", type: "combat" },
    { range: [186, 200], description: "A pride of lions stalking the party.", type: "combat" },
  ],
  Swamp: [
    { range: [1, 15], description: "A witch's hut on stilts smelling of strange herbs.", type: "social" },
    { range: [16, 30], description: "A patch of quicksand hidden by lily pads.", type: "hazard" },
    { range: [31, 45], description: "A lizardfolk hunting party tracking a beast.", type: "social" },
    { range: [46, 60], description: "A sunken boat containing a locked chest.", type: "benefit" },
    { range: [61, 75], description: "A rare orchid that can be used for potions.", type: "benefit" },
    { range: [76, 95], description: "Thick fog that smells of decay and obscures the path.", type: "hazard" },
    { range: [96, 115], description: "Swarms of blood-sucking mosquitoes causing irritation.", type: "survival" },
    { range: [116, 135], description: "Poisonous gas bubbling up from the muck.", type: "survival" },
    { range: [136, 155], description: "Will-o'-wisps leading the party into deep mud.", type: "hazard" },
    { range: [156, 170], description: "Giant frogs jumping out of the murky water.", type: "combat" },
    { range: [171, 185], description: "A black pudding oozing from a rotten log.", type: "combat" },
    { range: [186, 200], description: "A hydra's roar echoing from the deep swamp.", type: "combat" },
  ],
  Arctic: [
    { range: [1, 15], description: "An abandoned ice cave with strange carvings.", type: "social" },
    { range: [16, 30], description: "A family of seals sunning themselves on the ice.", type: "social" },
    { range: [31, 45], description: "A frozen explorer holding a map.", type: "benefit" },
    { range: [46, 60], description: "A crack in the ice revealing a dark abyss.", type: "hazard" },
    { range: [61, 75], description: "An aurora borealis that fills the sky with light.", type: "benefit" },
    { range: [76, 95], description: "A group of ice mephits playing pranks.", type: "social" },
    { range: [96, 120], description: "A blinding blizzard that halts all movement and freezes the blood.", type: "survival" },
    { range: [121, 140], description: "Treacherous thin ice over a freezing lake.", type: "survival" },
    { range: [141, 160], description: "A group of yeti hunting for prey.", type: "combat" },
    { range: [161, 180], description: "A polar bear guarding its cubs.", type: "combat" },
    { range: [181, 200], description: "A white dragon's lair hidden in a glacier.", type: "combat" },
  ],
  Coast: [
    { range: [1, 15], description: "A shipwreck washed up on the beach.", type: "benefit" },
    { range: [16, 30], description: "A message in a bottle floating in the surf.", type: "social" },
    { range: [31, 45], description: "A pod of dolphins swimming alongside the shore.", type: "social" },
    { range: [46, 60], description: "A lighthouse with a flickering light.", type: "social" },
    { range: [61, 75], description: "Giant crabs scuttling across the sand.", type: "social" },
    { range: [76, 95], description: "A sudden tidal wave that sweeps over the path.", type: "hazard" },
    { range: [96, 120], description: "A thick coastal fog that hides jagged rocks.", type: "survival" },
    { range: [121, 145], description: "High tide blocking the coastal pass.", type: "survival" },
    { range: [146, 165], description: "A group of sahuagin raiding a coastal village.", type: "combat" },
    { range: [166, 185], description: "A sea hag's cave filled with trinkets.", type: "combat" },
    { range: [186, 200], description: "A group of pirates burying their loot.", type: "combat" },
  ],
  Underdark: [
    { range: [1, 15], description: "A lake of bioluminescent fish.", type: "benefit" },
    { range: [16, 30], description: "A field of zurkhwood mushrooms.", type: "benefit" },
    { range: [31, 45], description: "A patch of dangerous shriekers that alert enemies.", type: "hazard" },
    { range: [46, 60], description: "A mind flayer's thrall wandering aimlessly.", type: "social" },
    { range: [61, 75], description: "A duergar mining camp.", type: "social" },
    { range: [76, 95], description: "A sudden cave-in that traps the party.", type: "hazard" },
    { range: [96, 120], description: "Toxic spores floating in the air.", type: "survival" },
    { range: [121, 145], description: "A labyrinth of tunnels where it's easy to get lost.", type: "survival" },
    { range: [146, 160], description: "A group of drow scouts moving silently.", type: "combat" },
    { range: [161, 175], description: "A giant spider's web blocking the tunnel.", type: "combat" },
    { range: [176, 190], description: "A beholder's eye stalk watching from the dark.", type: "combat" },
    { range: [191, 200], description: "An ancient aboleth whispering in your mind.", type: "combat" },
  ],
};

export function getTravelEncounter(terrain: Terrain, roll: number, typeFilter: EncounterType | "all" = "all"): EncounterOutcome | null {
  const table = TRAVEL_ENCOUNTER_TABLES[terrain];
  if (typeFilter === "all") {
    return table.find(o => roll >= o.range[0] && roll <= o.range[1]) || null;
  }
  const filteredTable = table.filter(o => o.type === typeFilter);
  if (filteredTable.length === 0) return null;
  // Map the 1-200 roll to the filtered list
  const index = Math.floor(((roll - 1) / 200) * filteredTable.length);
  return filteredTable[index];
}

export function rollD200(): number {
  return Math.floor(Math.random() * 200) + 1;
}
