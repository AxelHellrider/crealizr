"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Visual state of the top progress bar at any point in its animation sequence. */
type ProgressState = {
  width: number;
  opacity: number;
  visible: boolean;
};

type ProgressAction =
  | { type: "START" }
  | { type: "SET_WIDTH"; value: number }
  | { type: "FADE_OUT" }
  | { type: "COMPLETE" };

const initialState: ProgressState = { width: 0, opacity: 0, visible: false };

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case "START":
      return { width: 8, opacity: 1, visible: true };
    case "SET_WIDTH":
      return { ...state, width: action.value };
    case "FADE_OUT":
      return { ...state, opacity: 0 };
    case "COMPLETE":
      return { ...state, visible: false, width: 0 };
    default:
      return state;
  }
}

export default function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const key = useMemo(() => `${pathname}?${search?.toString() ?? ""}`,[pathname, search]);
  const [{ width, opacity, visible }, dispatch] = useReducer(progressReducer, initialState);
  const timers = useRef<number[]>([]);

  // Computed once on mount; media-query changes mid-session are rare enough to ignore
  const prefersReducedMotion = useRef(
    typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ).current;

  useEffect(() => {
    // start progress on route key change
    // clear any pending timers
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];

    // Trigger state updates in the next tick to avoid cascading render lint warning
    const tStart = window.setTimeout(() => {
      dispatch({ type: "START" });

      if (prefersReducedMotion) {
        // quick flash
        const t1 = window.setTimeout(() => dispatch({ type: "SET_WIDTH", value: 100 }), 50);
        const t2 = window.setTimeout(() => dispatch({ type: "FADE_OUT" }), 200);
        const t3 = window.setTimeout(() => dispatch({ type: "COMPLETE" }), 380);
        timers.current.push(t1, t2, t3);
        return;
      }

      // staged increments to feel alive
      const t1 = window.setTimeout(() => dispatch({ type: "SET_WIDTH", value: 35 }), 120);
      const t2 = window.setTimeout(() => dispatch({ type: "SET_WIDTH", value: 70 }), 380);
      const t3 = window.setTimeout(() => dispatch({ type: "SET_WIDTH", value: 90 }), 900);

      // completion sequence
      const t4 = window.setTimeout(() => dispatch({ type: "SET_WIDTH", value: 100 }), 1050);
      const t5 = window.setTimeout(() => dispatch({ type: "FADE_OUT" }), 1250);
      const t6 = window.setTimeout(() => dispatch({ type: "COMPLETE" }), 1450);
      timers.current.push(t1, t2, t3, t4, t5, t6);
    }, 0);

    timers.current.push(tStart);

    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [key]);

  if (!visible) return null;
  return (
    <div className="top-progress" style={{ width: `${width}%`, opacity }} />
  );
}
