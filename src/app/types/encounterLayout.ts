export type GridCoord = { col: number; row: number };

export type NodeKind = "party" | "enemy" | "hazard" | "cover";
export type HazardSource = "environment" | "spell";
export type CoverLevel = "half" | "three-quarter" | "full";

interface BaseNode {
    id: string;
    kind: NodeKind;
    coord: GridCoord;
    label?: string;
}

export interface PartyNode extends BaseNode {
    kind: "party";
}

export interface EnemyNode extends BaseNode {
    kind: "enemy";
    cr: number;
    isBoss: boolean;
}

export interface HazardNode extends BaseNode {
    kind: "hazard";
    source: HazardSource;
    notes?: string;
}

export interface CoverNode extends BaseNode {
    kind: "cover";
    coverLevel: CoverLevel;
}

export type EncounterNode = PartyNode | EnemyNode | HazardNode | CoverNode;

export type ManualNode = HazardNode | CoverNode;
