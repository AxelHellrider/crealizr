// engine/encounter/hexGrid.ts
// Hex-grid geometry for the battle-map: odd-r offset coordinates, pixel
// projection, cube-coordinate distance/radius math. Pure and framework-free
// so it's reusable by the renderer, AoE calculations, and tests alike.

import type { GridCoord } from "@/app/types/encounterLayout";

// ── Grid constants ──────────────────────────────────────────────────────────
export const R = 25;
export const W = Math.sqrt(3) * R;
export const ROW_H = R * 1.5;
export const SX = R + 4;
export const SY = R + 8;

export const HORIZ_GRID_W = Math.round(SX + 7 * W + W / 2 + R + 4);
export const VERT_GRID_W  = Math.round(SX + 3 * W + W / 2 + R + 4);

export const CELL_BUFFER = 2;
export const MIN_ZOOM    = 0.4;
export const MAX_ZOOM    = 3;
export const ZOOM_STEP   = 1.25;

// ── Pixel projection ─────────────────────────────────────────────────────────
/** Projects odd-r offset grid coordinates to pixel space; odd rows are shifted right by half a hex width to interlock with even rows. */
export function hexCenter(col: number, row: number): [number, number] {
    return [SX + col * W + (row % 2) * (W / 2), SY + row * ROW_H];
}

/** Flat-top hexagon vertex offsets (relative to center) for a given radius, used as Konva `points` for outline/fill/select/AoE polygons. */
export function hexPoints(r: number): number[] {
    const pts: number[] = [];
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push(r * Math.cos(a), r * Math.sin(a));
    }
    return pts;
}

export const HEX_OUTLINE = hexPoints(R - 1);
export const HEX_FILL    = hexPoints(R - 2);
export const HEX_SELECT  = hexPoints(R - 0.5);
export const HEX_AOE     = hexPoints(R - 0.5);

// ── Hex grid math (odd-r offset ↔ cube) ─────────────────────────────────────
/** Converts odd-r offset coordinates to cube coordinates (q, r, s) — offset math can't express hex distance/radius directly, cube math can. */
export function offsetToCube(col: number, row: number): [number, number, number] {
    const q = col - (row - (row & 1)) / 2;
    return [q, row, -q - row];
}

/** Distance in hex steps between two grid cells, via cube-coordinate Chebyshev distance. */
export function hexDistance(a: GridCoord, b: GridCoord): number {
    const [q1, r1, s1] = offsetToCube(a.col, a.row);
    const [q2, r2, s2] = offsetToCube(b.col, b.row);
    return Math.max(Math.abs(q1 - q2), Math.abs(r1 - r2), Math.abs(s1 - s2));
}

/** All grid cells within `radius` hex-steps of the center, used for hazard AoE templates. */
export function hexesInRadius(centerCol: number, centerRow: number, radius: number): GridCoord[] {
    const [cq, cr] = offsetToCube(centerCol, centerRow);
    const result: GridCoord[] = [];
    for (let dq = -radius; dq <= radius; dq++) {
        for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
            const r = cr + dr;
            result.push({ col: (cq + dq) + (r - (r & 1)) / 2, row: r });
        }
    }
    return result;
}

/** Snaps an arbitrary pixel position to its nearest hex coordinate. */
export function nearestCoord(x: number, y: number): GridCoord {
    let best: GridCoord = { col: 0, row: 0 };
    let bestDist = Infinity;
    const approxRow = Math.round((y - SY) / ROW_H);
    const approxCol = Math.round((x - SX) / W);
    for (let row = approxRow - 1; row <= approxRow + 1; row++)
        for (let col = approxCol - 1; col <= approxCol + 1; col++) {
            const [cx, cy] = hexCenter(col, row);
            const d = (cx - x) ** 2 + (cy - y) ** 2;
            if (d < bestDist) { bestDist = d; best = { col, row }; }
        }
    return best;
}
