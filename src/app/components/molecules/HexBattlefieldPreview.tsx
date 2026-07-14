type HexTile = {
    row: number;
    col: number;
    kind: "party" | "enemy" | "boss" | "hazard";
    label: string;
};

// A small, static snapshot of what the Encounter Builder's battlefield looks
// like — same color coding as the real canvas (party=green, enemy=gold,
// boss=crimson, hazard=purple) — purely decorative, no interactivity.
const TILES: HexTile[] = [
    { row: 0, col: 0, kind: "party", label: "PC" },
    { row: 0, col: 1, kind: "party", label: "PC" },
    { row: 1, col: 1, kind: "hazard", label: "AoE" },
    { row: 0, col: 2, kind: "party", label: "PC" },
    { row: 1, col: 2, kind: "enemy", label: "2" },
    { row: 2, col: 1, kind: "enemy", label: "3" },
    { row: 2, col: 2, kind: "boss", label: "7" },
];

const STYLES: Record<HexTile["kind"], { fill: string; stroke: string }> = {
    party:  { fill: "rgba(52,211,153,0.10)",  stroke: "rgba(52,211,153,0.65)" },
    enemy:  { fill: "rgba(197,160,89,0.10)",  stroke: "rgba(197,160,89,0.55)" },
    boss:   { fill: "rgba(220,38,38,0.14)",   stroke: "rgba(220,38,38,0.7)"  },
    hazard: { fill: "rgba(168,85,247,0.14)",  stroke: "rgba(168,85,247,0.65)" },
};

// Flat-top hexagon vertices, same construction as the real battlefield (engine/encounter/hexGrid.ts hexPoints).
const HEX_R = 30;
function hexPoints(cx: number, cy: number): string {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push(`${cx + HEX_R * Math.cos(a)},${cy + HEX_R * Math.sin(a)}`);
    }
    return pts.join(" ");
}

const COL_W = HEX_R * Math.sqrt(3);
const ROW_H = HEX_R * 1.5;
const VIEW_W = COL_W * 4;
const VIEW_H = ROW_H * 2.6;

export function HexBattlefieldPreview({ className = "" }: { className?: string }) {
    return (
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className={className} aria-hidden="true">
            {TILES.map((tile, i) => {
                const style = STYLES[tile.kind];
                const cx = HEX_R + tile.col * COL_W + (tile.row % 2 === 1 ? COL_W / 2 : 0);
                const cy = HEX_R + tile.row * ROW_H;
                return (
                    <g key={i}>
                        <polygon points={hexPoints(cx, cy)} fill={style.fill} stroke={style.stroke} strokeWidth={1.5} />
                        <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="var(--font-serif), serif" fontSize={11} fontWeight={700} fill={style.stroke}>
                            {tile.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
