import type { ConditionId } from "@/app/data/conditions";

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
    aoeRadius: number;
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
