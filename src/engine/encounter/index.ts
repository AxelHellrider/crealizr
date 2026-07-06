// engine/encounter — everything needed to compute and lay out a D&D encounter.
//
//   xpTables.ts    XP thresholds/tables (5e 2014 & 2024 DMG) + party XP budget
//   crMath.ts      CR-based budgeting (the non-XP alternative)
//   suggestions.ts catalog queries + combinatorics + suggest*/recommend* search
//   service.ts     public facade — picks XP vs CR mode, one result shape
//   hexGrid.ts     battle-map hex geometry (pixel projection, distance, radius)
//   layout.ts      battle-map node placement reducer (auto-slotting, occupancy)
//
// UI code should generally only need `service.ts` (via this barrel) for
// suggestions, and `hexGrid.ts` + `layout.ts` for the battle map.

export * from "./xpTables";
export * from "./crMath";
export * from "./suggestions";
export * from "./service";
export * from "./hexGrid";
export * from "./layout";
