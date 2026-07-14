import type { Ruleset } from "@/engine/encounter";
import { hexesInCone, hexesInLine, hexesInRadius, hexDirectionLabel } from "@/engine/encounter";
import type { EncounterNode, GridCoord, HazardNode } from "@/app/types/encounterLayout";
import type { ArmedTool, MapMode } from "@/app/types/encounterLayout";
import { formatCR } from "@/app/lib/format";
import { getConditions } from "@/app/data/conditions";

/** Battlefield map interaction mode -> the tool it arms for click-to-place. */
export function toArmedTool(mode: MapMode): ArmedTool {
    if (mode === "place-hazard-env")  return { kind: "hazard", source: "environment" };
    if (mode === "place-hazard-spell") return { kind: "hazard", source: "spell" };
    if (mode === "place-cover")        return { kind: "cover" };
    return null;
}

/** Abbreviated condition tags for a node's canvas label (e.g. "PRN · STN"). */
export function conditionAbbrs(node: EncounterNode, ruleset: Ruleset): string {
    if (node.kind !== "party" && node.kind !== "enemy") return "";
    if (!node.conditions?.length) return "";
    const defs = getConditions(ruleset);
    return node.conditions
        .map(id => defs.find(c => c.id === id)?.abbr)
        .filter(Boolean)
        .join(" · ");
}

/** Fill/stroke/opacity for a node's hex shape on the battlefield canvas. */
export function nodeStyle(node: EncounterNode) {
    switch (node.kind) {
        case "party":   return { fill: "rgba(52,211,153,0.08)",  stroke: "rgba(52,211,153,0.48)",  strokeWidth: 1.5, opacity: 1 };
        case "enemy":   return node.isBoss
            ? { fill: "rgba(220,38,38,0.11)",  stroke: "rgba(220,38,38,0.52)",  strokeWidth: 2,   opacity: 1 }
            : { fill: "rgba(197,160,89,0.07)", stroke: "rgba(197,160,89,0.38)", strokeWidth: 1.5, opacity: 1 };
        case "hazard":  return node.source === "spell"
            ? { fill: "rgba(168,85,247,0.14)", stroke: "rgba(168,85,247,0.55)", strokeWidth: 1.5, opacity: 1 }
            : { fill: "rgba(217,119,6,0.14)",  stroke: "rgba(217,119,6,0.55)",  strokeWidth: 1.5, opacity: 1 };
        case "cover": {
            const opacity = node.coverLevel === "full" ? 1 : node.coverLevel === "three-quarter" ? 0.80 : 0.58;
            return { fill: "rgba(56,189,248,0.28)", stroke: "rgba(56,189,248,0.95)", strokeWidth: 2, opacity };
        }
    }
}

/** Short in-canvas label for a node (falls back to a kind-based default). */
export function nodeLabel(node: EncounterNode): string {
    switch (node.kind) {
        case "party":  return node.label || "PC";
        case "enemy":  return node.label || (node.isBoss ? "Boss" : "Monster");
        case "hazard": return node.label || (node.source === "spell" ? "Spell" : "Hazard");
        case "cover":  return node.label || "Cover";
    }
}

/** Drawer/editor heading for a node (distinct from `nodeLabel`, which is the short canvas tag). */
export function nodeTitle(node: EncounterNode): string {
    switch (node.kind) {
        case "party": return "Party member";
        case "enemy": return `${node.isBoss ? "Boss" : "Enemy"} · CR ${formatCR(node.cr)}`;
        case "hazard": return `${node.source} hazard`;
        case "cover": return "cover";
    }
}

/** One-line summary of a node's current settings, shown on hover. */
export function nodeSettingsSummary(node: EncounterNode, ruleset: Ruleset): string {
    switch (node.kind) {
        case "party": {
            const defs = getConditions(ruleset);
            const names = (node.conditions ?? []).map(id => defs.find(c => c.id === id)?.name).filter(Boolean);
            return names.length ? names.join(", ") : "No conditions";
        }
        case "enemy": {
            const defs = getConditions(ruleset);
            const names = (node.conditions ?? []).map(id => defs.find(c => c.id === id)?.name).filter(Boolean);
            const conditionsText = names.length ? names.join(", ") : "No conditions";
            return `CR ${formatCR(node.cr)}${node.isBoss ? " · Boss" : ""} · ${conditionsText}`;
        }
        case "cover": {
            const levels: Record<string, string> = { half: "Half Cover", "three-quarter": "Three-Quarters Cover", full: "Full Cover" };
            return levels[node.coverLevel];
        }
        case "hazard": {
            const parts = [node.source === "spell" ? "Spell hazard" : "Environmental hazard"];
            if (node.aoeRadius <= 0) {
                parts.push("No AoE");
            } else if (node.aoeShape === "cone" && node.source === "spell") {
                parts.push(`Cone · ${hexDirectionLabel(node.aoeDirection ?? 0)}`);
            } else if (node.aoeShape === "line" && node.source === "spell") {
                parts.push(`Line · ${hexDirectionLabel(node.aoeDirection ?? 0)}`);
            } else {
                parts.push(`Radius ${node.aoeRadius}`);
            }
            return parts.join(" · ");
        }
    }
}

/** Hexes covered by a hazard's area of effect, per its 5e AoE template — Sphere/Cube/Cylinder ("burst", radiates from origin), Cone, or Line. */
export function hazardAoEHexes(hazard: HazardNode): GridCoord[] {
    const { col, row } = hazard.coord;
    const shape = hazard.aoeShape ?? "burst";
    const direction = hazard.aoeDirection ?? 0;
    switch (shape) {
        case "cone": return hexesInCone(col, row, hazard.aoeRadius, direction);
        case "line": return hexesInLine(col, row, hazard.aoeRadius, direction);
        default:     return hexesInRadius(col, row, hazard.aoeRadius);
    }
}
