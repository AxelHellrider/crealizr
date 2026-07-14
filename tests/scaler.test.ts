import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock matrix is designed to make proportional HP scaling clearly visible.
// srcRow HP values must differ from the test monster's actual HP so the
// old bug (collapsing to tgtRow.hp) would have produced a wrong answer.
vi.mock("@/app/data/constants", () => {
  const ABILITY_SCORE_MODIFIERS = {
    "-5": [1],
    "-4": [2, 3],
    "-3": [4, 5],
    "-2": [6, 7],
    "-1": [8, 9],
    "0": [10, 11],
    "+1": [12, 13],
    "+2": [14, 15],
    "+3": [16, 17],
    "+4": [18, 19],
    "+5": [20, 21],
    "+6": [22, 23],
    "+7": [24, 25],
    "+8": [26, 27],
    "+9": [28, 29],
    "+10": [30],
  } as const;

  // Intentional srcRow.hp = 40 so a monster with hp:80 (2× baseline) stays 2×
  // the target's baseline after scaling — not just equal to the target row.
  const CR_MATRIX = [
    { cr: 0.125, pb: "+2", ac: 13, hp: 40,  atkb: "+3", dpr: { min: 3, max: 5 },   save_dc: 13 },
    { cr: 0.5,   pb: "+2", ac: 13, hp: 60,  atkb: "+3", dpr: { min: 6, max: 8 },   save_dc: 13 },
    { cr: 1,     pb: "+2", ac: 15, hp: 80,  atkb: "+4", dpr: { min: 9, max: 15 },  save_dc: 13 },
    { cr: 5,     pb: "+3", ac: 17, hp: 140, atkb: "+6", dpr: { min: 33, max: 39 }, save_dc: 15 },
  ];

  return { ABILITY_SCORE_MODIFIERS, CR_MATRIX };
});

import type { MonsterBase } from "@/app/types/monsters_schema";
import { scaleMonster } from "@/app/utils/scaler";

// Baseline monster: hp matches srcRow so scale factor = 1 and finalHP = tgtRow.hp
const baseMonster = (): MonsterBase => ({
  name: "Test Goblin",
  edition: "2014",
  size: "Small",
  type: "humanoid",
  alignment: "neutral",
  cr: 0.125,
  terrain: ["dungeon", "wilderness"],
  affiliation: "humanoid",
  genus: "goblinoid",
  xp: 25,
  dpr: { min: 20, max: 40, range: "far" },
  stats: {
    ac: 12,
    hp: 40,   // matches mock srcRow.hp — baseline creature
    speed: "30 ft",
    str: 10, dex: 14, con: 10, int: 8, wis: 10, cha: 8,
  },
  actions: [
    { name: "Scimitar", damage: "1d6+2" },
    { name: "Shortbow", damage: "1d6+2" },
  ],
});

describe("scaleMonster", () => {
  let monster: MonsterBase;
  beforeEach(() => {
    monster = baseMonster();
  });

  // ── HP scaling ──────────────────────────────────────────────────────────────

  it("scales baseline HP proportionally from srcRow to tgtRow", () => {
    // monster.hp 40 == srcRow.hp 40 → hpScale = 80/40 = 2 → finalHP = 80
    const scaled = scaleMonster(monster, 1);
    expect(scaled.cr).toBe(1);
    expect(scaled.stats.hp).toBe(80);
  });

  it("preserves HP outliers above baseline (tanky creature stays tanky)", () => {
    // hp:80 is 2× srcRow.hp(40) → hpScale = 80/40 = 2 → finalHP = 2×80 = 160
    // The OLD bug would have given: 80/80 × 80 = 80 (same as any CR-1/8 monster)
    const tanky = { ...monster, stats: { ...monster.stats, hp: 80 } };
    const scaled = scaleMonster(tanky, 1);
    expect(scaled.stats.hp).toBe(160);
  });

  it("preserves HP outliers below baseline (fragile creature stays fragile)", () => {
    // hp:20 is 0.5× srcRow.hp(40) → hpScale = 80/40 = 2 → finalHP = 0.5×80 = 40
    // The OLD bug would have given: 80/20 × 20 = 80 (same as any CR-1/8 monster)
    const fragile = { ...monster, stats: { ...monster.stats, hp: 20 } };
    const scaled = scaleMonster(fragile, 1);
    expect(scaled.stats.hp).toBe(40);
  });

  it("two monsters at the same CR scaled to the same target produce different HP", () => {
    const tanky   = { ...monster, stats: { ...monster.stats, hp: 80 } };
    const fragile = { ...monster, stats: { ...monster.stats, hp: 20 } };
    const scaledTanky   = scaleMonster(tanky,   5);
    const scaledFragile = scaleMonster(fragile,  5);
    // Both start at CR 1/8. Tanky should end up with significantly more HP.
    expect(scaledTanky.stats.hp).toBeGreaterThan(scaledFragile.stats.hp);
    // Exact values: hpScale = 140/40 = 3.5 → tanky: 80×3.5=280, fragile: 20×3.5=70
    expect(scaledTanky.stats.hp).toBe(280);
    expect(scaledFragile.stats.hp).toBe(70);
  });

  it("HP has a minimum of 1", () => {
    const zeroHp = { ...monster, stats: { ...monster.stats, hp: 0 } };
    const scaled = scaleMonster(zeroHp, 1);
    expect(scaled.stats.hp).toBeGreaterThanOrEqual(1);
  });

  // ── AC scaling ──────────────────────────────────────────────────────────────

  it("defaults to Dex-based AC (10 + Dex modifier)", () => {
    // dex 14 → mod +2 → 10 + 2 = 12
    const scaled = scaleMonster(monster, 1);
    expect(scaled.stats.ac).toBe(12);
  });

  it("computes Dex-based AC from the scaled Dex modifier (max +10 mod → AC 20, below the monster cap)", () => {
    const highDex = { ...monster, stats: { ...monster.stats, dex: 30 } };
    const scaled = scaleMonster(highDex, 1, { acSource: "dex" });
    expect(scaled.stats.ac).toBe(20);
  });

  it("computes equipped-armor AC as 10 + armor bonus, uncapped", () => {
    const scaled = scaleMonster(monster, 1, { acSource: "armor", armorBonus: 25 });
    expect(scaled.stats.ac).toBe(35);
  });

  it("uses the natural armor value directly, capped at 30 without items", () => {
    const scaled = scaleMonster(monster, 1, { acSource: "natural", naturalArmor: 25 });
    expect(scaled.stats.ac).toBe(25);
    const overCap = scaleMonster(monster, 1, { acSource: "natural", naturalArmor: 40 });
    expect(overCap.stats.ac).toBe(30);
  });

  it("adds a flat +2 for a held shield on top of any AC source, uncapped", () => {
    const dexShield = scaleMonster(monster, 1, { acSource: "dex", hasShield: true });
    expect(dexShield.stats.ac).toBe(14); // 12 + 2

    const naturalAtCap = scaleMonster(monster, 1, { acSource: "natural", naturalArmor: 30, hasShield: true });
    expect(naturalAtCap.stats.ac).toBe(32); // capped 30 + shield pushes past cap
  });

  // ── Ability score scaling ───────────────────────────────────────────────────

  it("scales ability scores by modifier steps and applies bonuses", () => {
    const m: MonsterBase = { ...monster, cr: 1 };
    const res = scaleMonster(m, 5, { abilityScoreBonus: { str: 1, int: 2 } });
    // STR 10 (mod 0) → +2 mod → nearest score with +2 is 14; +1 bonus → 15
    expect(res.stats.str).toBe(15);
    // DEX 14 (mod +2) → +2 mod → +4 mod → nearest 18
    expect(res.stats.dex).toBe(18);
    // INT 8 (mod -1) → +2 mod → +1 mod → nearest 12; +2 bonus → 14
    expect(res.stats.int).toBe(14);
  });

  // ── Advice fields ───────────────────────────────────────────────────────────

  it("computes advice fields (attack bonus, save DC, DPR) when actions are present", () => {
    const res = scaleMonster(monster, 1) as unknown as { _advice?: Record<string, unknown> };
    const advice = res._advice!;
    // Two 1d6+2 attacks: avg (3.5+2)×2 = 11 per action sum, estimateDPR rounds to 11
    expect(advice.srcDPR).toBe(11);
    expect(advice.tgtDPR).toBe(12); // mock matrix CR 1 dpr midpoint round((9+15)/2)
    expect(typeof advice.dprScale).toBe("number");
    expect(advice.dprNote).toBeUndefined();
    expect(typeof advice.suggestedAttackBonus).toBe("number");
    expect(typeof advice.suggestedSaveDC).toBe("number");
  });

  it("returns the official DMG DPR range for the target CR, not a synthetic band", () => {
    const res = scaleMonster(monster, 1);
    // mock matrix CR 1 dpr range is 9–15, taken verbatim from the matrix row
    expect(res.dpr).toEqual({ min: 9, max: 15, range: "9–15" });
  });

  it("omits dprScale and adds dprNote when no actions are provided", () => {
    const noActions = { ...monster, actions: [] };
    const res = scaleMonster(noActions, 1) as unknown as { _advice?: Record<string, unknown> };
    const advice = res._advice!;
    expect(advice.srcDPR).toBeNull();
    expect(advice.dprScale).toBeUndefined();
    expect(typeof advice.dprNote).toBe("string");
  });

  // ── Fractional CRs ─────────────────────────────────────────────────────────

  it("handles fractional CR targets (1/2)", () => {
    // srcRow (CR 1/8) hp=40, tgtRow (CR 1/2) hp=60 → hpScale=1.5 → finalHP=round(40×1.5)=60
    const res = scaleMonster(monster, 0.5);
    expect(res.cr).toBe(0.5);
    expect(res.stats.hp).toBe(60);
  });

  it("returns unchanged monster when source and target CR are identical", () => {
    const res = scaleMonster(monster, 0.125);
    expect(res.stats.hp).toBe(monster.stats.hp);
    expect(res.stats.ac).toBe(monster.stats.ac);
  });
});
