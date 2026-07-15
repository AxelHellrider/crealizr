"use client";

import { useNumpad } from "@/app/context/NumpadContext";
import { useMountTransition, useLastNonNull } from "@/app/hooks/useMountTransition";

const SHEET_TRANSITION_MS = 400;

const ROWS = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    ["±", "0", "⌫"],
] as const;

export function Numpad() {
    const numpad = useNumpad();
    const config = numpad?.config ?? null;

    // Keeps rendering the last non-null config while the sheet plays its
    // close transition — config itself goes null the instant the sheet
    // starts closing, but useMountTransition keeps the node mounted a bit
    // longer, so its content needs to survive that window too.
    const renderedConfig = useLastNonNull(config);

    const { mounted, visible } = useMountTransition(!!config, SHEET_TRANSITION_MS);

    if (!numpad || !mounted || !renderedConfig) return null;
    const { displayValue, append, backspace, toggleSign, commit } = numpad;

    function handleKey(key: string) {
        if (key === "⌫") return backspace();
        if (key === "±") return toggleSign();
        append(key);
    }

    return (
        <>
            <div
                className={`fixed inset-0 z-[10000] bg-black/50 transition-opacity duration-[400ms] ease-in-out ${visible ? "opacity-100" : "opacity-0"}`}
                onPointerDown={() => { commit(); }}
            />
            <div
                className="fixed bottom-0 left-0 right-0 z-[10001] bg-background border-t border-gold/20 rounded-t-2xl shadow-2xl overflow-hidden transition-transform duration-[400ms]"
                style={{
                    transform: visible ? "translateY(0)" : "translateY(100%)",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gold/10">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-bold min-w-0 truncate">
                        {renderedConfig.label ?? "Enter value"}
                    </span>
                    <span className="text-3xl font-bold font-mono min-w-[5ch] text-right accent-gold">
                        {displayValue}
                    </span>
                    <button
                        type="button"
                        onPointerDown={(e) => { e.preventDefault(); commit(); }}
                        className="shrink-0 px-5 py-2 rounded-sm bg-gold/10 border border-gold/30 text-gold text-sm font-bold uppercase tracking-widest hover:bg-gold/20 active:scale-95 transition-all"
                    >
                        Done
                    </button>
                </div>

                {/* Key grid */}
                <div className="grid grid-cols-3 gap-2 p-4">
                    {ROWS.flat().map((key) => {
                        const isDisabled = key === "±" && !renderedConfig.allowNegative;
                        const isBackspace = key === "⌫";
                        return (
                            <button
                                key={key}
                                type="button"
                                aria-label={key === "⌫" ? "Backspace" : key === "±" ? "Toggle sign" : key}
                                onPointerDown={(e) => { e.preventDefault(); if (!isDisabled) handleKey(key); }}
                                disabled={isDisabled}
                                className={`
                                    py-5 text-xl font-bold rounded-md border transition-all select-none
                                    active:scale-95
                                    disabled:opacity-20 disabled:cursor-not-allowed
                                    ${isBackspace
                                        ? "bg-crimson/10 border-crimson/20 text-crimson hover:bg-crimson/20"
                                        : "bg-card border-gold/10 hover:bg-gold/10 hover:border-gold/30 active:bg-gold/15"
                                    }
                                `}
                            >
                                {key}
                            </button>
                        );
                    })}
                </div>

                {/* Safe-area bottom spacer */}
                <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
            </div>
        </>
    );
}
