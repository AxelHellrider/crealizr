// utils/travelEncounter.ts

export const TERRAINS = ["Forest", "Desert", "Mountains", "Plains", "Swamp", "Arctic", "Coast", "Underdark"] as const;
export type Terrain = (typeof TERRAINS)[number];

export const ENCOUNTER_TYPES = ["combat", "survival", "social", "hazard", "benefit"] as const;
export type EncounterType = (typeof ENCOUNTER_TYPES)[number];

export interface EncounterOutcome {
  range: [number, number];
  description: string;
  type: EncounterType;
}

type EncounterSeed = {
  type: EncounterType;
  description: string;
};

type TemplateSet = {
  subjects: string[];
  templates: string[];
};

const PER_TYPE_COUNT = 50;
const RANGE_TOTAL = 500;
const RANGE_BASE = 1;
const RANGE_MAX = 2;

const TERRAIN_SEEDS: Record<Terrain, Record<EncounterType, TemplateSet>> = {
  Forest: {
    combat: {
      subjects: [
        "wolves circle the camp",
        "owlbears contest a carcass",
        "goblin trappers spring from brush",
        "a boar-like beast charges",
        "bandit archers fire from trees",
        "a giant spider drops from the canopy",
        "a bear defends its berry patch",
        "a corrupted dryad lashes out",
        "bugbears stalk the rear guard",
        "a treant stirs its saplings"
      ],
      templates: [
        "{subject} at dusk.",
        "{subject} after tracking the party.",
        "{subject} as the trail narrows.",
        "{subject} near a fallen log.",
        "{subject} while the party rests."
      ]
    },
    survival: {
      subjects: [
        "dense thickets choke the trail",
        "a downpour swells streams",
        "fallen trees block progress",
        "fresh leaf litter hides tracks",
        "night noises disrupt rest",
        "a creeping fog masks landmarks",
        "a swollen creek floods the path",
        "overgrowth hides markers",
        "a wildfire scar forces a detour",
        "cold rain soaks gear"
      ],
      templates: [
        "{subject} for hours.",
        "{subject} and slows travel.",
        "{subject} without warning.",
        "{subject} until a path is cut.",
        "{subject} and drains morale."
      ]
    },
    social: {
      subjects: [
        "a woodcutter shares rumors",
        "an elven scout warns of a curse",
        "a herbalist seeks rare mushrooms",
        "a druid asks for help",
        "a ranger offers a guide",
        "a traveling tinker seeks shelter",
        "a charcoal burner invites the party",
        "a lost hunter asks for aid",
        "a forester requests help marking trails",
        "a hermit begs for quiet travel"
      ],
      templates: [
        "{subject} near a stream.",
        "{subject} beneath a wide oak.",
        "{subject} as evening falls.",
        "{subject} at a small campsite.",
        "{subject} along a narrow trail."
      ]
    },
    hazard: {
      subjects: [
        "a vine-laced ravine opens",
        "poison ivy clings to the path",
        "stinging insects erupt from a log",
        "a hunter snare catches a foot",
        "rotting ground gives way",
        "a fungus patch releases spores",
        "a heavy branch falls",
        "roots trip mounts",
        "a hornets' nest drops",
        "a sinkhole hides under leaf litter"
      ],
      templates: [
        "{subject} beside the trail.",
        "{subject} during a quick rest.",
        "{subject} in the dense undergrowth.",
        "{subject} just after the party passes.",
        "{subject} on a narrow ridge."
      ]
    },
    benefit: {
      subjects: [
        "a clear spring bubbles",
        "a stag leads to a game trail",
        "a hollow tree hides arrows",
        "wild berries boost morale",
        "a sheltered grove blocks the wind",
        "a druidic marker shows a safe crossing",
        "a tree hollow hides dry firewood",
        "a mossy glade offers rest",
        "a bird guide reveals a shortcut",
        "a cache of herbal salves is found"
      ],
      templates: [
        "{subject} at sunrise.",
        "{subject} along the route.",
        "{subject} just off the path.",
        "{subject} near a quiet clearing.",
        "{subject} before nightfall."
      ]
    }
  },
  Desert: {
    combat: {
      subjects: [
        "giant scorpions burst from dunes",
        "sand riders attempt a raid",
        "a desert cat stalks the party",
        "jackalweres circle at night",
        "a blue drake swoops low",
        "bandits strike in the heat",
        "a dune stalker erupts",
        "raiders try to steal mounts",
        "a sand elemental lashes out",
        "hyenas join the hunt"
      ],
      templates: [
        "{subject} by a dry wash.",
        "{subject} as the sun peaks.",
        "{subject} near a rocky outcrop.",
        "{subject} after a mirage fades.",
        "{subject} while the party camps."
      ]
    },
    survival: {
      subjects: [
        "blistering heat drains water",
        "a sandstorm cuts visibility",
        "dunes shift and erase the path",
        "cold night winds bite hard",
        "a waterskin splits",
        "mirages waste precious hours",
        "a rocky ridge forces a climb",
        "salt flats confuse direction",
        "a dry riverbed offers no water",
        "a sudden squall sandblasts gear"
      ],
      templates: [
        "{subject} for miles.",
        "{subject} without relief.",
        "{subject} and slows progress.",
        "{subject} until shelter is found.",
        "{subject} and drains stamina."
      ]
    },
    social: {
      subjects: [
        "nomads trade water for news",
        "a caravan master seeks guards",
        "a mystic recites a dune riddle",
        "a lost traveler seeks an oasis",
        "a camel herder asks for help",
        "a shrine keeper requests an offering",
        "a spice trader offers a bargain",
        "a guide demands proof of intent",
        "a scout warns of a storm",
        "a pilgrim seeks the right star"
      ],
      templates: [
        "{subject} near a caravan camp.",
        "{subject} beside a rock spire.",
        "{subject} at a faded trail marker.",
        "{subject} by a dry well.",
        "{subject} as the sun sets."
      ]
    },
    hazard: {
      subjects: [
        "quicksand hides under a crust",
        "a scorpion nest stirs",
        "salt glare blinds the party",
        "a sinkhole opens suddenly",
        "whipping sand scours skin",
        "a dry wash floods",
        "a dune collapses underfoot",
        "a heat mirage leads to a cliff",
        "biting flies cloud vision",
        "thorn patches shred footwear"
      ],
      templates: [
        "{subject} near the route.",
        "{subject} in the midday heat.",
        "{subject} at a narrow pass.",
        "{subject} beside a rocky ridge.",
        "{subject} while breaking camp."
      ]
    },
    benefit: {
      subjects: [
        "a shaded overhang offers rest",
        "desert lilies can be brewed for healing",
        "an intact ruin provides shelter",
        "a cached water barrel is found",
        "a cool wind speeds travel",
        "a hidden oasis offers fresh water",
        "a forgotten well is usable",
        "a friendly nomad shares a shortcut",
        "a buried map case surfaces",
        "a narrow canyon provides shade"
      ],
      templates: [
        "{subject} along the dune line.",
        "{subject} just off the main trail.",
        "{subject} after a long march.",
        "{subject} before nightfall.",
        "{subject} as the heat breaks."
      ]
    }
  },
  Mountains: {
    combat: {
      subjects: [
        "harpies lure travelers",
        "crag cats ambush from above",
        "a wyvern dives at stragglers",
        "duergar raiders emerge",
        "a mountain giant hurls stones",
        "griffons defend a nest",
        "wolves herd prey toward a ravine",
        "a troll demands a toll",
        "brigands fire from ledges",
        "a rival climber sabotages ropes"
      ],
      templates: [
        "{subject} near a cliff edge.",
        "{subject} as the pass narrows.",
        "{subject} during a steep ascent.",
        "{subject} by a rocky shelf.",
        "{subject} when the wind rises."
      ]
    },
    survival: {
      subjects: [
        "thin air forces frequent rests",
        "ice slicks the trail",
        "a rope bridge sways",
        "avalanche risk closes the pass",
        "falling temperatures threaten exposure",
        "a broken trail costs hours",
        "loose scree breaks footing",
        "a mountain storm rolls in",
        "fresh snow blocks a pass",
        "a cold wind demands shelter"
      ],
      templates: [
        "{subject} without warning.",
        "{subject} for the day.",
        "{subject} until a detour is found.",
        "{subject} and slows travel.",
        "{subject} and drains endurance."
      ]
    },
    social: {
      subjects: [
        "dwarven miners offer a trade",
        "a hermit monk invites rest",
        "a goat herder warns of rockfall",
        "a lost climber asks for help",
        "rangers check permits",
        "a shrine keeper blesses passage",
        "a courier seeks help crossing",
        "a mountaineer shares a map",
        "a guide needs aid with a mule",
        "a pilgrim asks to share a fire"
      ],
      templates: [
        "{subject} near a cairn.",
        "{subject} at a narrow pass.",
        "{subject} beside a cliff path.",
        "{subject} in a sheltered alcove.",
        "{subject} as dusk approaches."
      ]
    },
    hazard: {
      subjects: [
        "loose shale tumbles",
        "a hidden crevasse opens",
        "lightning strikes the ridge",
        "a ledge crumbles",
        "a cave exhales fumes",
        "cliff wasps swarm",
        "a boulder loosens above",
        "a brittle ice shelf cracks",
        "a frosted ledge slicks boots",
        "a landslide blocks the path"
      ],
      templates: [
        "{subject} at the trail edge.",
        "{subject} during a climb.",
        "{subject} in a narrow switchback.",
        "{subject} near a rope bridge.",
        "{subject} as the party passes."
      ]
    },
    benefit: {
      subjects: [
        "a sheltered cave offers warmth",
        "a mountain spring replenishes supplies",
        "a high vantage reveals a shortcut",
        "a cache of climbing gear is found",
        "a friendly eagle shows a safe path",
        "a sunlit ledge allows recovery",
        "a stone bridge avoids a ford",
        "a calm pass opens briefly",
        "a warm updraft speeds the climb",
        "a miner cache contains rations"
      ],
      templates: [
        "{subject} just ahead.",
        "{subject} before the ridge.",
        "{subject} along the slope.",
        "{subject} after a hard ascent.",
        "{subject} as the sky clears."
      ]
    }
  },
  Plains: {
    combat: {
      subjects: [
        "gnolls attack from tall grass",
        "bandits rise from the field",
        "lions stalk the herd",
        "riders challenge the party",
        "a stampede rushes forward",
        "a giant boar charges",
        "wolves chase a wounded elk",
        "a militia blocks the road",
        "raiders try to seize supplies",
        "a bulette erupts from the earth"
      ],
      templates: [
        "{subject} at midday.",
        "{subject} near a wagon track.",
        "{subject} as the party rests.",
        "{subject} across open ground.",
        "{subject} near a creek."
      ]
    },
    survival: {
      subjects: [
        "a thunderstorm slows travel",
        "open ground offers no shade",
        "strong winds disrupt navigation",
        "a river crossing adds hours",
        "grass fire spreads fast",
        "night travel risks getting lost",
        "a dust storm reduces visibility",
        "a swollen stream blocks the route",
        "a cold snap chills the party",
        "marshy ground forces a detour"
      ],
      templates: [
        "{subject} for the afternoon.",
        "{subject} without warning.",
        "{subject} until the weather shifts.",
        "{subject} and drains stamina.",
        "{subject} and slows the march."
      ]
    },
    social: {
      subjects: [
        "a farm family offers a meal",
        "a traveling circus seeks escort",
        "a wandering bard gathers stories",
        "a merchant cart needs repair",
        "a militia patrol asks questions",
        "a shepherd requests help",
        "a rancher seeks strays",
        "a courier offers a ride",
        "a grain trader seeks guards",
        "a local asks for help at a shrine"
      ],
      templates: [
        "{subject} beside a windmill.",
        "{subject} near a field road.",
        "{subject} at a small crossroads.",
        "{subject} as evening falls.",
        "{subject} on a low hill."
      ]
    },
    hazard: {
      subjects: [
        "a sinkhole opens in the prairie",
        "lightning ignites dry grass",
        "biting flies drain stamina",
        "badger holes trip mounts",
        "a hailstorm bruises skin",
        "a collapsed bridge blocks travel",
        "a flooded ditch traps wheels",
        "a prairie quake rattles the ground",
        "a windmill collapses",
        "a sudden gust topples crates"
      ],
      templates: [
        "{subject} near the road.",
        "{subject} during a short rest.",
        "{subject} without warning.",
        "{subject} in open ground.",
        "{subject} as the party passes."
      ]
    },
    benefit: {
      subjects: [
        "a clear stream offers water",
        "a hilltop campsite is safe",
        "a rider shares a shortcut",
        "healing herbs grow nearby",
        "a tailwind speeds travel",
        "a patrol cache holds supplies",
        "a farmer offers fresh bread",
        "a calm stretch allows fast travel",
        "a wagon trail provides easy footing",
        "a clear sky aids navigation"
      ],
      templates: [
        "{subject} just ahead.",
        "{subject} near a fence line.",
        "{subject} along the route.",
        "{subject} before sunset.",
        "{subject} after a long march."
      ]
    }
  },
  Swamp: {
    combat: {
      subjects: [
        "giant frogs leap from water",
        "a hydra roars nearby",
        "lizardfolk hunters demand tribute",
        "a shambling mound rises",
        "a crocodile drags at the rear",
        "will-o-wisps lure prey",
        "stirges swarm from reeds",
        "bullywugs ambush",
        "a giant leech clamps on",
        "a bog mummy rises"
      ],
      templates: [
        "{subject} in the murk.",
        "{subject} as mist thickens.",
        "{subject} near a broken boardwalk.",
        "{subject} in shallow water.",
        "{subject} while the party camps."
      ]
    },
    survival: {
      subjects: [
        "thick fog obscures the path",
        "sinking mud slows travel",
        "rotting planks snap",
        "mosquito swarms sap endurance",
        "tainted water spoils rations",
        "a detour around deep water",
        "hidden channels confuse navigation",
        "a storm floods the trail",
        "a dense canopy blocks light",
        "a broken pole slows travel"
      ],
      templates: [
        "{subject} for hours.",
        "{subject} without warning.",
        "{subject} and drains morale.",
        "{subject} until a safe path is found.",
        "{subject} and slows the march."
      ]
    },
    social: {
      subjects: [
        "a witch offers a bargain",
        "a bog guide offers passage",
        "a lizardfolk scout seeks parley",
        "a reclusive alchemist seeks venom",
        "a fisher needs help with a boat",
        "a caravan is stuck in mud",
        "a marsh priest offers a ward",
        "a trapper seeks a lost camp",
        "a village elder warns of a beast",
        "a druid asks to cleanse a pool"
      ],
      templates: [
        "{subject} on a raised hummock.",
        "{subject} near a reed island.",
        "{subject} by a foggy inlet.",
        "{subject} at a crooked dock.",
        "{subject} as night falls."
      ]
    },
    hazard: {
      subjects: [
        "quicksand hides beneath lilies",
        "toxic gas bubbles up",
        "leeches cling to exposed skin",
        "a rotten tree collapses",
        "venomous snakes are disturbed",
        "a floating corpse spreads disease",
        "a submerged stump tears a boat",
        "gnats blind the party",
        "a sinkhole opens in peat",
        "muddy water surges suddenly"
      ],
      templates: [
        "{subject} near the trail.",
        "{subject} in the shallows.",
        "{subject} at a narrow crossing.",
        "{subject} during a quick rest.",
        "{subject} as the party passes."
      ]
    },
    benefit: {
      subjects: [
        "a rare orchid can be harvested",
        "a hidden hummock provides dry rest",
        "a sunken chest yields salvage",
        "a swamp spirit grants passage",
        "edible roots replenish food",
        "a calm channel speeds a boat",
        "a wooden causeway shortens the route",
        "a sheltered hut offers a dry fire",
        "a clear pool holds clean water",
        "a heron guide reveals a safe ford"
      ],
      templates: [
        "{subject} just ahead.",
        "{subject} along the waterline.",
        "{subject} after a long slog.",
        "{subject} near a reed bank.",
        "{subject} before nightfall."
      ]
    }
  },
  Arctic: {
    combat: {
      subjects: [
        "a polar bear defends its cubs",
        "yeti hunters stalk the party",
        "winter wolves circle",
        "ice mephits harass the line",
        "a remorhaz erupts from snow",
        "a white dragon shadow passes low",
        "a frost troll blocks the pass",
        "ice wolves test the party",
        "a hungry owlbear prowls",
        "a panicked reindeer herd charges"
      ],
      templates: [
        "{subject} in the whiteout.",
        "{subject} near a snowdrift.",
        "{subject} as the wind rises.",
        "{subject} at a frozen ridge.",
        "{subject} while the party camps."
      ]
    },
    survival: {
      subjects: [
        "a blizzard forces a halt",
        "thin ice threatens a crossing",
        "freezing winds demand layers",
        "supplies freeze unless insulated",
        "whiteout conditions erase landmarks",
        "a sled breaks and slows travel",
        "a crack splits the ice road",
        "a cold snap forces shelter",
        "a sudden thaw weakens ice",
        "a snowdrift buries the trail"
      ],
      templates: [
        "{subject} for the day.",
        "{subject} without warning.",
        "{subject} and drains endurance.",
        "{subject} until the storm passes.",
        "{subject} and slows progress."
      ]
    },
    social: {
      subjects: [
        "a trapper shares hot tea",
        "an ice fisher needs help",
        "a nomad offers a warm tent",
        "a lost explorer seeks guidance",
        "a frost druid warns of thin ice",
        "a shrine keeper offers a blessing",
        "a guide needs help with a sled",
        "a hunter shares fresh meat",
        "a scout warns of a storm",
        "a village elder asks for aid"
      ],
      templates: [
        "{subject} near a frozen lake.",
        "{subject} beside a snow shelter.",
        "{subject} at a windbreak.",
        "{subject} by a jagged ridge.",
        "{subject} as dusk falls."
      ]
    },
    hazard: {
      subjects: [
        "a hidden crevasse yawns open",
        "a crack spreads across the ice",
        "icicles fall from a ledge",
        "a snow shelf collapses",
        "freezing mist numbs hands",
        "a slick slope risks a slide",
        "sharp wind hurls ice shards",
        "a frozen lake groans",
        "a brittle ridge fractures",
        "an avalanche roars down"
      ],
      templates: [
        "{subject} near the path.",
        "{subject} during a climb.",
        "{subject} as the party passes.",
        "{subject} in a sudden gust.",
        "{subject} without warning."
      ]
    },
    benefit: {
      subjects: [
        "a clear ice cave offers shelter",
        "an aurora lifts morale",
        "a cache of dry firewood is found",
        "a hot spring provides warmth",
        "a snowdrift hides a useful tool",
        "a friendly seal leads to a crossing",
        "a rock windbreak reduces chill",
        "a clear sky aids navigation",
        "a sturdy sled is found",
        "a safe ice bridge shortens the route"
      ],
      templates: [
        "{subject} just ahead.",
        "{subject} near a frozen ridge.",
        "{subject} after a long march.",
        "{subject} as the storm clears.",
        "{subject} before nightfall."
      ]
    }
  },
  Coast: {
    combat: {
      subjects: [
        "sahuagin raid from the surf",
        "pirates ambush from a skiff",
        "giant crabs swarm a tide pool",
        "sea hag minions skulk in fog",
        "a territorial merrow challenges the party",
        "smugglers fight to protect a cache",
        "a giant octopus drags a boat",
        "a shark attacks in shallows",
        "raiders strike during low tide",
        "a sea serpent surfaces nearby"
      ],
      templates: [
        "{subject} near the shoreline.",
        "{subject} at a rocky inlet.",
        "{subject} during a fog bank.",
        "{subject} while the party rests.",
        "{subject} as the tide shifts."
      ]
    },
    survival: {
      subjects: [
        "high tide blocks the path",
        "coastal fog hides hazards",
        "strong winds slow travel",
        "a squall soaks gear",
        "a rocky detour adds hours",
        "salt spray ruins rations",
        "a storm surge delays travel",
        "a rising swell makes boats unsafe",
        "cold rain chills the party",
        "a slick shoreline slows movement"
      ],
      templates: [
        "{subject} for the afternoon.",
        "{subject} without warning.",
        "{subject} and slows progress.",
        "{subject} until the tide turns.",
        "{subject} and drains stamina."
      ]
    },
    social: {
      subjects: [
        "a lighthouse keeper asks a delivery",
        "a fisher offers a ride",
        "a sailor searches for a lost mate",
        "a beachcomber offers salvage",
        "a coastal patrol checks for contraband",
        "a priest of tides offers a blessing",
        "a shipwright seeks driftwood",
        "a harbormaster asks for news",
        "a trader offers passage",
        "a youth seeks a lost net"
      ],
      templates: [
        "{subject} near the pier.",
        "{subject} on a windy bluff.",
        "{subject} by a beached boat.",
        "{subject} at a small cove.",
        "{subject} as gulls circle overhead."
      ]
    },
    hazard: {
      subjects: [
        "a rogue wave crashes over the trail",
        "jagged rocks tear at boots",
        "a cliff collapses",
        "urchins hide in a tide pool",
        "slick algae causes slips",
        "a sinkhole opens in wet sand",
        "a gust topples stacked crates",
        "a rotting pier gives way",
        "salt spray blinds the party",
        "a hidden reef scrapes the hull"
      ],
      templates: [
        "{subject} near the path.",
        "{subject} during a quick rest.",
        "{subject} as the tide rises.",
        "{subject} in a sudden squall.",
        "{subject} at the edge of the surf."
      ]
    },
    benefit: {
      subjects: [
        "a shipwreck yields supplies",
        "a bottle holds a map",
        "dolphins guide a safe route",
        "a hidden cove offers calm waters",
        "a fisher shares fresh catch",
        "a driftwood cache provides fuel",
        "low tide exposes a shortcut",
        "a calm harbor allows rest",
        "a fresh breeze speeds travel",
        "a sailor offers safe passage"
      ],
      templates: [
        "{subject} just ahead.",
        "{subject} along the shore.",
        "{subject} near a tide pool.",
        "{subject} after a long walk.",
        "{subject} before the tide changes."
      ]
    }
  },
  Underdark: {
    combat: {
      subjects: [
        "drow scouts stalk the party",
        "a giant spider drops from above",
        "duergar raiders emerge",
        "a hook horror charges",
        "a roper waits among stalactites",
        "a beholderkin eye spies and attacks",
        "a chuul drags prey toward a pool",
        "a carrion crawler surges from a crevice",
        "an umber hulk bursts through a wall",
        "grimlocks attack in the dark"
      ],
      templates: [
        "{subject} near a side tunnel.",
        "{subject} as torches dim.",
        "{subject} in echoing darkness.",
        "{subject} beside a fungus grove.",
        "{subject} while the party rests."
      ]
    },
    survival: {
      subjects: [
        "a maze of tunnels misleads",
        "toxic spores drift through the air",
        "a cave-in blocks the route",
        "a narrow squeeze slows travel",
        "strange echoes confuse navigation",
        "an underground river forces a detour",
        "a low ceiling forces crawling",
        "a pitch-black stretch tests supplies",
        "a magnetic field warps compasses",
        "a sinkhole opens to a lower tunnel"
      ],
      templates: [
        "{subject} for hours.",
        "{subject} without warning.",
        "{subject} and slows progress.",
        "{subject} until a new route is found.",
        "{subject} and drains morale."
      ]
    },
    social: {
      subjects: [
        "myconids offer spores to trade",
        "a duergar merchant seeks goods",
        "a lost deep gnome seeks escort",
        "a svirfneblin guide offers passage",
        "a mind flayer thrall begs for freedom",
        "a derro prophet rants of omens",
        "a kuo-toa priest offers a blessing",
        "a fungus farmer seeks help",
        "a scout warns of a collapse",
        "a traveler seeks a lost caravan"
      ],
      templates: [
        "{subject} near a crystal outcrop.",
        "{subject} by a fungus field.",
        "{subject} in a quiet cavern.",
        "{subject} at a narrow bridge.",
        "{subject} as echoes fade."
      ]
    },
    hazard: {
      subjects: [
        "shriekers alert predators",
        "slippery fungus coats the floor",
        "a sinkhole opens into darkness",
        "stalactites fall without warning",
        "a thin stone bridge threatens collapse",
        "bad air smothers flames",
        "a tremor shakes loose debris",
        "a pool of acid blocks the path",
        "webs tangle gear",
        "a false floor collapses into a pit"
      ],
      templates: [
        "{subject} near the route.",
        "{subject} during a short rest.",
        "{subject} in a narrow corridor.",
        "{subject} as the party passes.",
        "{subject} without warning."
      ]
    },
    benefit: {
      subjects: [
        "a vein of rare ore can be harvested",
        "a bioluminescent pool provides water",
        "a safe alcove hides a cache",
        "glowshrooms light the path",
        "a friendly fungus grants a brew",
        "a carved waymarker reveals a shortcut",
        "a stable ledge offers safe rest",
        "a clear tunnel avoids danger",
        "a cache of rope is found",
        "a calm cavern reduces echo noise"
      ],
      templates: [
        "{subject} just ahead.",
        "{subject} near a side passage.",
        "{subject} along the main tunnel.",
        "{subject} after a long crawl.",
        "{subject} before the next junction."
      ]
    }
  }
};

function expandTemplates(set: TemplateSet): string[] {
  const results: string[] = [];
  for (const template of set.templates) {
    for (const subject of set.subjects) {
      results.push(template.replace("{subject}", subject));
    }
  }
  return results;
}

function buildTerrainEntries(terrain: Terrain): EncounterSeed[] {
  const grouped = ENCOUNTER_TYPES.map((type) => {
    const set = TERRAIN_SEEDS[terrain][type];
    const items = expandTemplates(set);
    if (items.length !== PER_TYPE_COUNT) {
      throw new Error(`Expected ${PER_TYPE_COUNT} ${type} entries for ${terrain}, found ${items.length}.`);
    }
    return { type, items };
  });

  const entries: EncounterSeed[] = [];
  for (let i = 0; i < PER_TYPE_COUNT; i += 1) {
    for (const group of grouped) {
      entries.push({ type: group.type, description: group.items[i] });
    }
  }

  return entries;
}

function assignRanges(entries: EncounterSeed[]): EncounterOutcome[] {
  const total = RANGE_TOTAL;
  const base = RANGE_BASE;
  const max = RANGE_MAX;
  const count = entries.length;
  const extra = total - base * count;

  if (extra < 0 || extra > count * (max - base)) {
    throw new Error(`Cannot assign ranges: total=${total}, base=${base}, count=${count}.`);
  }

  const sizes = Array.from({ length: count }, () => base);
  if (extra > 0) {
    for (let i = 0; i < extra; i += 1) {
      const idx = Math.floor((i * count) / extra);
      sizes[idx] += 1;
    }
  }

  let start = 1;
  const outcomes = entries.map((entry) => {
    const size = sizes.shift() ?? base;
    const end = start + size - 1;
    const outcome: EncounterOutcome = {
      range: [start, end],
      description: entry.description,
      type: entry.type
    };
    start = end + 1;
    return outcome;
  });

  if (start !== total + 1) {
    throw new Error(`Range assignment failed to reach ${total}.`);
  }

  return outcomes;
}

export const TRAVEL_ENCOUNTER_TABLES: Record<Terrain, EncounterOutcome[]> = Object.fromEntries(
  TERRAINS.map((terrain) => [terrain, assignRanges(buildTerrainEntries(terrain))])
) as Record<Terrain, EncounterOutcome[]>;

export function getTravelEncounter(terrain: Terrain, roll: number, typeFilter: EncounterType | "all" = "all"): EncounterOutcome | null {
  const table = TRAVEL_ENCOUNTER_TABLES[terrain];
  if (typeFilter === "all") {
    return table.find((o) => roll >= o.range[0] && roll <= o.range[1]) || null;
  }
  const filteredTable = table.filter((o) => o.type === typeFilter);
  if (filteredTable.length === 0) return null;
  const index = Math.floor(((roll - 1) / RANGE_TOTAL) * filteredTable.length);
  return filteredTable[index];
}

export function rollD500(): number {
  return Math.floor(Math.random() * RANGE_TOTAL) + 1;
}
