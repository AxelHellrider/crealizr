// Simple 2014 DMG encounter math helpers (mobile-friendly, no heavy deps)

export const XP_THRESHOLDS_2014: Record<number, { easy: number; medium: number; hard: number; deadly: number }> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

export const XP_PER_CR_2014: Record<string, number> = {
  "0": 10, // using 10 as placeholder for 0 XP minions
  "0.125": 25,
  "0.25": 50,
  "0.5": 100,
  "1": 200,
  "2": 450,
  "3": 700,
  "4": 1100,
  "5": 1800,
  "6": 2300,
  "7": 2900,
  "8": 3900,
  "9": 5000,
  "10": 5900,
  "11": 7200,
  "12": 8400,
  "13": 10000,
  "14": 11500,
  "15": 13000,
  "16": 15000,
  "17": 18000,
  "18": 20000,
  "19": 22000,
  "20": 25000,
  "21": 33000,
  "22": 41000,
  "23": 50000,
  "24": 62000,
  "25": 75000,
  "26": 90000,
  "27": 105000,
  "28": 120000,
  "29": 135000,
  "30": 155000,
};

// --- 2024 ruleset tables (initially aligned to 2014 for parity) ---
export const XP_THRESHOLDS_2024: Record<number, { easy: number; medium: number; hard: number; deadly: number }> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

export const XP_PER_CR_2024: Record<string, number> = {
  "0": 10,
  "0.125": 25,
  "0.25": 50,
  "0.5": 100,
  "1": 200,
  "2": 450,
  "3": 700,
  "4": 1100,
  "5": 1800,
  "6": 2300,
  "7": 2900,
  "8": 3900,
  "9": 5000,
  "10": 5900,
  "11": 7200,
  "12": 8400,
  "13": 10000,
  "14": 11500,
  "15": 13000,
  "16": 15000,
  "17": 18000,
  "18": 20000,
  "19": 22000,
  "20": 25000,
  "21": 33000,
  "22": 41000,
  "23": 50000,
  "24": 62000,
  "25": 75000,
  "26": 90000,
  "27": 105000,
  "28": 120000,
  "29": 135000,
  "30": 155000,
};

export function encounterMultiplier(count: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 1.5;
  if (count <= 6) return 2;
  if (count <= 10) return 2.5;
  if (count <= 14) return 3;
  return 4;
}

export function partyBudget(level: number, size: number, difficulty: keyof (typeof XP_THRESHOLDS_2014)[1]) {
  const lvl = Math.min(20, Math.max(1, Math.round(level)));
  const perChar = XP_THRESHOLDS_2014[lvl][difficulty];
  return perChar * Math.max(1, size);
}

export function partyBudget2024(level: number, size: number, difficulty: keyof (typeof XP_THRESHOLDS_2024)[1]) {
  const lvl = Math.min(20, Math.max(1, Math.round(level)));
  const perChar = XP_THRESHOLDS_2024[lvl][difficulty];
  return perChar * Math.max(1, size);
}

export type EncounterSuggestion = {
  cr: number;
  count: number;
  xpEach: number;
  adjustedXP: number;
  fit: number; // closeness to budget (1.0 = exact)
};

export function suggestEncounters(opts: { level: number; size: number; difficulty: keyof (typeof XP_THRESHOLDS_2014)[1]; }): EncounterSuggestion[] {
  const budget = partyBudget(opts.level, opts.size, opts.difficulty);
  const crKeys = Object.keys(XP_PER_CR_2014).map(Number).sort((a, b) => a - b);

  const suggestions: EncounterSuggestion[] = [];

  for (const cr of crKeys) {
    const xpEach = XP_PER_CR_2014[String(cr)];
    for (let count = 1; count <= 8; count++) {
      const adj = Math.round(xpEach * count * encounterMultiplier(count));
      const fit = Math.min(budget, adj) / Math.max(budget, adj);
      if (fit >= 0.7) {
        suggestions.push({ cr, count, xpEach, adjustedXP: adj, fit });
      }
    }
  }

  suggestions.sort((a, b) => b.fit - a.fit || a.adjustedXP - b.adjustedXP);
  return suggestions.slice(0, 12);
}

export function suggestEncounters2024(opts: { level: number; size: number; difficulty: keyof (typeof XP_THRESHOLDS_2024)[1]; }): EncounterSuggestion[] {
  const budget = partyBudget2024(opts.level, opts.size, opts.difficulty);
  const crKeys = Object.keys(XP_PER_CR_2024).map(Number).sort((a, b) => a - b);

  const suggestions: EncounterSuggestion[] = [];

  for (const cr of crKeys) {
    const xpEach = XP_PER_CR_2024[String(cr)];
    for (let count = 1; count <= 8; count++) {
      const adj = Math.round(xpEach * count * encounterMultiplier(count));
      const fit = Math.min(budget, adj) / Math.max(budget, adj);
      if (fit >= 0.7) {
        suggestions.push({ cr, count, xpEach, adjustedXP: adj, fit });
      }
    }
  }

  suggestions.sort((a, b) => b.fit - a.fit || a.adjustedXP - b.adjustedXP);
  return suggestions.slice(0, 12);
}

// --- Group (mixed-CR) encounter suggestions ---
export type GroupMember = { cr: number; count: number; xpEach: number };
export type GroupSuggestion = {
  members: GroupMember[]; // breakdown, e.g., [{cr: 3, count:1}, {cr: 0.5, count:2}]
  totalCount: number;
  adjustedXP: number;
  fit: number;
};

function pickClosestCRs(targetXP: number, candidates: { cr: number; xp: number }[], take: number) {
  return [...candidates]
    .sort((a, b) => Math.abs(a.xp - targetXP) - Math.abs(b.xp - targetXP))
    .slice(0, take);
}

function computeAdjustedXP(members: GroupMember[]): number {
  const count = members.reduce((s, m) => s + m.count, 0);
  const base = members.reduce((s, m) => s + m.count * m.xpEach, 0);
  return Math.round(base * encounterMultiplier(count));
}

function normalizeMembers(members: GroupMember[]): GroupMember[] {
  // Merge same-CR entries and sort by CR asc
  const map = new Map<number, GroupMember>();
  for (const m of members) {
    const prev = map.get(m.cr);
    if (prev) prev.count += m.count; else map.set(m.cr, { ...m });
  }
  return [...map.values()].sort((a, b) => a.cr - b.cr);
}

export function suggestGroupEncounters(opts: { level: number; size: number; difficulty: keyof (typeof XP_THRESHOLDS_2014)[1]; }): GroupSuggestion[] {
  const budget = partyBudget(opts.level, opts.size, opts.difficulty);
  const crList = Object.keys(XP_PER_CR_2014).map((k) => ({ cr: Number(k), xp: XP_PER_CR_2014[k] })).sort((a, b) => a.cr - b.cr);

  const seen = new Set<string>();
  const results: GroupSuggestion[] = [];

  for (let N = 2; N <= 8; N++) {
    const targetPer = budget / (encounterMultiplier(N) * N);
    const close = pickClosestCRs(targetPer, crList, 6); // limit the branching

    // Two-type mixes
    for (let i = 0; i < close.length; i++) {
      for (let j = i; j < close.length; j++) {
        const A = close[i], B = close[j];
        for (let k = 1; k <= N - 1; k++) {
          const countA = k;
          const countB = N - k;
          const members = normalizeMembers([
            { cr: A.cr, count: countA, xpEach: A.xp },
            { cr: B.cr, count: countB, xpEach: B.xp },
          ]);
          const key = members.map((m) => `${m.cr}x${m.count}`).join("|");
          if (seen.has(key)) continue;
          const adj = computeAdjustedXP(members);
          const fit = Math.min(budget, adj) / Math.max(budget, adj);
          if (fit >= 0.7) {
            seen.add(key);
            results.push({ members, totalCount: N, adjustedXP: adj, fit });
          }
        }
      }
    }

    // Three-type mixes for small groups to add variety
    if (N <= 5) {
      const close3 = pickClosestCRs(targetPer, crList, 5);
      for (let a = 0; a < close3.length; a++) {
        for (let b = a; b < close3.length; b++) {
          for (let c = b; c < close3.length; c++) {
            for (let x = 1; x <= N - 2; x++) {
              for (let y = 1; y <= N - x - 1; y++) {
                const z = N - x - y;
                const members = normalizeMembers([
                  { cr: close3[a].cr, count: x, xpEach: close3[a].xp },
                  { cr: close3[b].cr, count: y, xpEach: close3[b].xp },
                  { cr: close3[c].cr, count: z, xpEach: close3[c].xp },
                ]);
                const key = members.map((m) => `${m.cr}x${m.count}`).join("|");
                if (seen.has(key)) continue;
                const adj = computeAdjustedXP(members);
                const fit = Math.min(budget, adj) / Math.max(budget, adj);
                if (fit >= 0.7) {
                  seen.add(key);
                  results.push({ members, totalCount: N, adjustedXP: adj, fit });
                }
              }
            }
          }
        }
      }
    }
  }

  results.sort((a, b) => b.fit - a.fit || a.adjustedXP - b.adjustedXP);
  return results.slice(0, 12);
}

export function suggestGroupEncounters2024(opts: { level: number; size: number; difficulty: keyof (typeof XP_THRESHOLDS_2024)[1]; }): GroupSuggestion[] {
  const budget = partyBudget2024(opts.level, opts.size, opts.difficulty);
  const crList = Object.keys(XP_PER_CR_2024).map((k) => ({ cr: Number(k), xp: XP_PER_CR_2024[k] })).sort((a, b) => a.cr - b.cr);

  const seen = new Set<string>();
  const results: GroupSuggestion[] = [];

  for (let N = 2; N <= 8; N++) {
    const targetPer = budget / (encounterMultiplier(N) * N);
    const close = pickClosestCRs(targetPer, crList, 6);

    for (let i = 0; i < close.length; i++) {
      for (let j = i; j < close.length; j++) {
        const A = close[i], B = close[j];
        for (let k = 1; k <= N - 1; k++) {
          const countA = k;
          const countB = N - k;
          const members = normalizeMembers([
            { cr: A.cr, count: countA, xpEach: A.xp },
            { cr: B.cr, count: countB, xpEach: B.xp },
          ]);
          const key = members.map((m) => `${m.cr}x${m.count}`).join("|");
          if (seen.has(key)) continue;
          const adj = computeAdjustedXP(members);
          const fit = Math.min(budget, adj) / Math.max(budget, adj);
          if (fit >= 0.7) {
            seen.add(key);
            results.push({ members, totalCount: N, adjustedXP: adj, fit });
          }
        }
      }
    }

    if (N <= 5) {
      const close3 = pickClosestCRs(targetPer, crList, 5);
      for (let a = 0; a < close3.length; a++) {
        for (let b = a; b < close3.length; b++) {
          for (let c = b; c < close3.length; c++) {
            for (let x = 1; x <= N - 2; x++) {
              for (let y = 1; y <= N - x - 1; y++) {
                const z = N - x - y;
                const members = normalizeMembers([
                  { cr: close3[a].cr, count: x, xpEach: close3[a].xp },
                  { cr: close3[b].cr, count: y, xpEach: close3[b].xp },
                  { cr: close3[c].cr, count: z, xpEach: close3[c].xp },
                ]);
                const key = members.map((m) => `${m.cr}x${m.count}`).join("|");
                if (seen.has(key)) continue;
                const adj = computeAdjustedXP(members);
                const fit = Math.min(budget, adj) / Math.max(budget, adj);
                if (fit >= 0.7) {
                  seen.add(key);
                  results.push({ members, totalCount: N, adjustedXP: adj, fit });
                }
              }
            }
          }
        }
      }
    }
  }

  results.sort((a, b) => b.fit - a.fit || a.adjustedXP - b.adjustedXP);
  return results.slice(0, 12);
}
