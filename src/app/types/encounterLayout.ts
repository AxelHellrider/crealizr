import type { ConditionId } from "@/app/data/conditions";

export type GridCoord = { col: number; row: number };

export type NodeKind = "party" | "enemy" | "hazard" | "cover";
export type HazardSource = "environment" | "spell";
export type CoverLevel = "half" | "three-quarter" | "full";
/** Matches the 5e area-of-effect templates (PHB "Areas of Effect"): a
 * Sphere/Cube/Cylinder radiates from its point of origin ("burst" here),
 * while a Cone or Line extends outward in one of the grid's 6 hex directions. */
export type AoEShape = "burst" | "cone" | "line";
/** Index into the grid's 6 hex directions (see hexGrid.ts DIRECTIONS). */
export type HexDirection = 0 | 1 | 2 | 3 | 4 | 5;

interface BaseNode {
    id: string;
    kind: NodeKind;
    coord: GridCoord;
    label?: string;
}

export interface PartyNode extends BaseNode {
    kind: "party";
    conditions?: ConditionId[];
}

export interface EnemyNode extends BaseNode {
    kind: "enemy";
    cr: number;
    isBoss: boolean;
    conditions?: ConditionId[];
}

export interface HazardNode extends BaseNode {
    kind: "hazard";
    source: HazardSource;
    notes?: string;
    /** Radius (burst/cone) or length (line) in hex steps from the origin hex. */
    aoeRadius: number;
    /** Defaults to "burst" (Sphere/Cube/Cylinder) when omitted. */
    aoeShape?: AoEShape;
    /** Facing for cone/line shapes; ignored for "burst". Defaults to 0. */
    aoeDirection?: HexDirection;
}

export interface CoverNode extends BaseNode {
    kind: "cover";
    coverLevel: CoverLevel;
}

export type EncounterNode = PartyNode | EnemyNode | HazardNode | CoverNode;

export type ManualNode = HazardNode | CoverNode;

export type CoverBenefit = {
    partyLabel: string;
    coverLevel: CoverLevel;
};

export type HazardEffect = {
    creatureLabel: string;
    creatureKind: "party" | "enemy";
    hazardLabel: string;
    source: HazardSource;
    notes?: string;
};
