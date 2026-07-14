"use client";

import { useEffect, useState } from "react";

const SHUFFLE_DURATION_MS = 650;
const SHUFFLE_TICK_MS = 55;

interface DiceRollProps {
    /** The final rolled value once settled; null before the first roll. */
    value: number | null;
    /** True while the shuffle animation should be running. */
    rolling: boolean;
    /** Called once the shuffle animation finishes and `value` is revealed. */
    onSettle?: () => void;
    /** Upper bound for the shuffled placeholder numbers (this app rolls a d500). */
    max?: number;
    label?: string;
}

/** A stylized die face that rapidly shuffles random numbers before settling on the real roll. */
export function DiceRoll({ value, rolling, onSettle, max = 500, label }: DiceRollProps) {
    const [display, setDisplay] = useState<number | null>(value);

    useEffect(() => {
        if (!rolling) return;

        const shuffle = window.setInterval(() => {
            setDisplay(Math.floor(Math.random() * max) + 1);
        }, SHUFFLE_TICK_MS);

        const settle = window.setTimeout(() => {
            window.clearInterval(shuffle);
            setDisplay(value);
            onSettle?.();
        }, SHUFFLE_DURATION_MS);

        return () => {
            window.clearInterval(shuffle);
            window.clearTimeout(settle);
        };
        // Only the start of a roll should (re)trigger the shuffle — `value` and
        // `onSettle` are read at settle time via the closure, not tracked here.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rolling, max]);

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={`flex items-center justify-center w-20 h-20 border-2 border-gold bg-card font-mono text-2xl font-bold text-gold shadow-glow transition-transform duration-150 ${rolling ? "scale-105" : "scale-100"}`}
                style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                aria-hidden="true"
            >
                {display ?? "–"}
            </div>
            {label && (
                <span className="text-[10px] uppercase tracking-widest text-muted">
                    {label}{display !== null && !rolling ? `: ${display}` : ""}
                </span>
            )}
        </div>
    );
}
