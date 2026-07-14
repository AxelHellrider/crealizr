export type Marquee = { x0: number; y0: number; x1: number; y1: number };

/** Drag-selection rectangle overlay on the battlefield canvas. */
export function MarqueeBox({ marquee }: { marquee: Marquee }) {
    const left   = Math.min(marquee.x0, marquee.x1);
    const top    = Math.min(marquee.y0, marquee.y1);
    const width  = Math.abs(marquee.x1 - marquee.x0);
    const height = Math.abs(marquee.y1 - marquee.y0);
    return (
        <div
            className="absolute pointer-events-none border border-gold/70 bg-gold/10"
            style={{ left, top, width, height }}
        />
    );
}
