"use client";

import { useEffect, useState } from "react";

/**
 * Keeps a component mounted long enough to play its CSS exit transition
 * before actually unmounting — the plain-CSS equivalent of framer-motion's
 * AnimatePresence for a single boolean "open" state.
 *
 * `mounted` gates whether to render the node at all; `visible` gates the
 * CSS classes/styles that represent the "open" state. Toggle `visible` in
 * a transition/duration-matched className, and don't unmount until
 * `mounted` goes false.
 */
export function useMountTransition(active: boolean, durationMs: number) {
    const [mounted, setMounted] = useState(active);
    const [visible, setVisible] = useState(active);

    // Mount immediately when activating; unmount only after the exit transition finishes.
    useEffect(() => {
        if (active) {
            const t = window.setTimeout(() => setMounted(true), 0);
            return () => window.clearTimeout(t);
        }
        const t = window.setTimeout(() => setMounted(false), durationMs);
        return () => window.clearTimeout(t);
    }, [active, durationMs]);

    // Toggle the "visible" (transitioned-in) state a tick after mount so the
    // browser paints the closed state first and the CSS transition actually
    // plays, instead of jumping straight to the open state.
    useEffect(() => {
        if (active) {
            const t = window.setTimeout(() => setVisible(true), 20);
            return () => window.clearTimeout(t);
        }
        const t = window.setTimeout(() => setVisible(false), 0);
        return () => window.clearTimeout(t);
    }, [active]);

    return { mounted, visible };
}

/**
 * Remembers the last non-null value seen, instead of flashing to null the
 * instant `value` does. Pairs with useMountTransition for modal-style
 * content: the sheet stays mounted (and its content stays rendered) through
 * the close transition, even though the source config already went null.
 */
export function useLastNonNull<T>(value: T | null): T | null {
    const [last, setLast] = useState(value);

    useEffect(() => {
        if (value === null) return;
        const t = window.setTimeout(() => setLast(value), 0);
        return () => window.clearTimeout(t);
    }, [value]);

    return last;
}
