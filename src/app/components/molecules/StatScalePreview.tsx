type StatRow = { label: string; before: number; after: number; max: number };

const DEFAULT_ROWS: StatRow[] = [
    { label: "AC",  before: 13, after: 16,  max: 20  },
    { label: "HP",  before: 90, after: 180, max: 200 },
    { label: "DPR", before: 12, after: 26,  max: 30  },
];

interface StatScalePreviewProps {
    className?: string;
    rows?: StatRow[];
    /** True (default) for the hero's decorative mockup use; false when this renders real, meaningful data. */
    decorative?: boolean;
}

// A small before/after bar comparison — mirrors the Monster Scaler's core
// output (stat scaled up alongside CR). Defaults to a decorative mockup;
// pass `rows` with real scaled values to show actual tool output.
export function StatScalePreview({ className = "", rows = DEFAULT_ROWS, decorative = true }: StatScalePreviewProps) {
    const pct = (value: number, max: number) => Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={`flex flex-col gap-2.5 ${className}`} aria-hidden={decorative || undefined}>
            {rows.map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                    <span className="w-7 shrink-0 text-[10px] uppercase tracking-widest text-muted font-bold">{row.label}</span>
                    <div className="relative flex-1 h-2 bg-silver/10 overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-silver/30" style={{ width: `${pct(row.before, row.max)}%` }} />
                        <div className="absolute inset-y-0 left-0 bg-gold" style={{ width: `${pct(row.after, row.max)}%` }} />
                    </div>
                    <span className="w-14 shrink-0 text-[10px] text-right font-medium text-foreground/80">{row.before} → {row.after}</span>
                </div>
            ))}
        </div>
    );
}
