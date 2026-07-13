"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import CrealizrMark from "@/app/components/atoms/CrealizrMark";
import { useSidebar } from "@/app/context/SidebarContext";

/** Visual state of the mark loading indicator at any point in its animation sequence. */
type ProgressState = {
  activeBars: number;
  opacity: number;
  visible: boolean;
};

type ProgressAction =
  | { type: "START" }
  | { type: "SET_BARS"; value: number }
  | { type: "FADE_OUT" }
  | { type: "COMPLETE" };

const initialState: ProgressState = { activeBars: 0, opacity: 0, visible: false };

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case "START":
      return { activeBars: 0, opacity: 1, visible: true };
    case "SET_BARS":
      return { ...state, activeBars: action.value };
    case "FADE_OUT":
      return { ...state, opacity: 0 };
    case "COMPLETE":
      return { ...state, visible: false, activeBars: 0 };
    default:
      return state;
  }
}

export default function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const key = useMemo(() => `${pathname}?${search?.toString() ?? ""}`,[pathname, search]);
  const [{ activeBars, opacity, visible }, dispatch] = useReducer(progressReducer, initialState);
  const timers = useRef<number[]>([]);
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen } = useSidebar();
  const sidebarOpenRef = useRef(sidebarOpen);
  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);

  // Computed once on mount; media-query changes mid-session are rare enough to ignore
  const [prefersReducedMotion] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  // Nav links use scroll={false} so App Router doesn't jump straight to
  // (0,0) — an instant scrollTop drop is what makes mobile browsers snap
  // their collapsible URL bar back open mid-navigation. Scrolling smoothly
  // here instead lands at the same place without the abrupt jump.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [pathname, prefersReducedMotion]);

  useEffect(() => {
    // start progress on route key change
    // clear any pending timers
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];

    // Trigger state updates in the next tick to avoid cascading render lint warning
    const tStart = window.setTimeout(() => {
      dispatch({ type: "START" });

      const finish = () => {
        dispatch({ type: "COMPLETE" });
        if (sidebarOpenRef.current) setSidebarOpen(false);
      };

      if (prefersReducedMotion) {
        // quick flash — all three bars at once
        const t1 = window.setTimeout(() => dispatch({ type: "SET_BARS", value: 3 }), 50);
        const t2 = window.setTimeout(() => dispatch({ type: "FADE_OUT" }), 200);
        const t3 = window.setTimeout(finish, 380);
        timers.current.push(t1, t2, t3);
        return;
      }

      // bars fill in one at a time, top to bottom, to feel alive
      const t1 = window.setTimeout(() => dispatch({ type: "SET_BARS", value: 1 }), 120);
      const t2 = window.setTimeout(() => dispatch({ type: "SET_BARS", value: 2 }), 450);
      const t3 = window.setTimeout(() => dispatch({ type: "SET_BARS", value: 3 }), 850);

      // completion sequence
      const t4 = window.setTimeout(() => dispatch({ type: "FADE_OUT" }), 1200);
      const t5 = window.setTimeout(finish, 1450);
      timers.current.push(t1, t2, t3, t4, t5);
    }, 0);

    timers.current.push(tStart);

    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [key, setSidebarOpen, prefersReducedMotion]);

  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-[9500] flex items-center justify-center bg-background pointer-events-none transition-opacity duration-200"
      style={{ opacity }}
      aria-hidden="true"
    >
      <CrealizrMark activeBars={activeBars} className="h-24 w-auto sm:h-32 text-gold" />
    </div>
  );
}
