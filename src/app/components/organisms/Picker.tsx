"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePicker } from "@/app/context/PickerContext";

const ROW_H = 44;
const VISIBLE_ROWS = 5;
const WHEEL_H = ROW_H * VISIBLE_ROWS;
const PAD = (WHEEL_H - ROW_H) / 2;

export function Picker() {
    const picker = usePicker();
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const [centerOffset, setCenterOffset] = useState(0);

    const config = picker?.config ?? null;
    const options = config?.options ?? [];

    // Position the wheel on the current value whenever the sheet opens.
    useEffect(() => {
        if (!config) return;
        const idx = Math.max(0, options.findIndex(o => o.value === config.value));
        setCenterOffset(idx);
        const raf = requestAnimationFrame(() => {
            containerRef.current?.scrollTo({ top: idx * ROW_H });
        });
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config?.label, config?.value]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const top = e.currentTarget.scrollTop;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => setCenterOffset(top / ROW_H));
    }, []);

    const commitIndex = useCallback((idx: number) => {
        if (!config) return;
        const clamped = Math.max(0, Math.min(options.length - 1, idx));
        const opt = options[clamped];
        if (opt) config.onCommit(opt.value);
        picker?.close();
    }, [config, options, picker]);

    const commitCentered = useCallback(() => commitIndex(Math.round(centerOffset)), [commitIndex, centerOffset]);

    const tapRow = (i: number) => commitIndex(i);

    return (
        <AnimatePresence>
            {config && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onPointerDown={commitCentered}
                    />
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-gold/20 rounded-t-2xl shadow-2xl overflow-hidden"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 32, stiffness: 320 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gold/10">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-bold min-w-0 truncate">
                                {config.label ?? "Select value"}
                            </span>
                            <button
                                type="button"
                                onPointerDown={(e) => { e.preventDefault(); commitCentered(); }}
                                className="shrink-0 px-5 py-2 rounded-sm bg-gold/10 border border-gold/30 text-gold text-sm font-bold uppercase tracking-widest hover:bg-gold/20 active:scale-95 transition-all"
                            >
                                Done
                            </button>
                        </div>

                        {/* Wheel */}
                        <div className="relative">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute left-4 right-4 border-y border-gold/30 bg-gold/5 z-10"
                                style={{ top: PAD, height: ROW_H }}
                            />
                            <div
                                ref={containerRef}
                                onScroll={handleScroll}
                                role="listbox"
                                aria-label={config.label}
                                className="overflow-y-scroll no-scrollbar"
                                style={{ height: WHEEL_H, scrollSnapType: "y mandatory", overscrollBehavior: "contain" }}
                            >
                                <div style={{ height: PAD }} aria-hidden="true" />
                                {options.map((opt, i) => {
                                    const distance = Math.abs(i - centerOffset);
                                    const opacity = Math.max(0.25, 1 - distance * 0.35);
                                    const scale = Math.max(0.8, 1 - distance * 0.1);
                                    const isCentered = Math.round(centerOffset) === i;
                                    return (
                                        <div
                                            key={opt.value + i}
                                            role="option"
                                            aria-selected={isCentered}
                                            onPointerDown={(e) => { e.preventDefault(); tapRow(i); }}
                                            className="flex items-center justify-center select-none cursor-pointer font-serif text-lg uppercase tracking-wide text-foreground"
                                            style={{ height: ROW_H, scrollSnapAlign: "center", opacity, transform: `scale(${scale})` }}
                                        >
                                            {opt.label}
                                        </div>
                                    );
                                })}
                                <div style={{ height: PAD }} aria-hidden="true" />
                            </div>
                        </div>

                        {/* Safe-area bottom spacer */}
                        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
