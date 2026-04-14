"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const key = useMemo(() => `${pathname}?${search?.toString() ?? ""}`,[pathname, search]);
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<number[]>([]);

  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    // start progress on route key change
    // clear any pending timers
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];

    // Trigger state updates in the next tick to avoid cascading render lint warning
    const tStart = window.setTimeout(() => {
      setVisible(true);
      setOpacity(1);
      setWidth(8);

      if (prefersReducedMotion) {
        // quick flash
        const t1 = window.setTimeout(() => setWidth(100), 50);
        const t2 = window.setTimeout(() => setOpacity(0), 200);
        const t3 = window.setTimeout(() => { setVisible(false); setWidth(0); }, 380);
        timers.current.push(t1, t2, t3);
        return;
      }

      // staged increments to feel alive
      const t1 = window.setTimeout(() => setWidth(35), 120);
      const t2 = window.setTimeout(() => setWidth(70), 380);
      const t3 = window.setTimeout(() => setWidth(90), 900);

      // completion sequence
      const t4 = window.setTimeout(() => setWidth(100), 1050);
      const t5 = window.setTimeout(() => setOpacity(0), 1250);
      const t6 = window.setTimeout(() => { setVisible(false); setWidth(0); }, 1450);
      timers.current.push(t1, t2, t3, t4, t5, t6);
    }, 0);

    timers.current.push(tStart);

    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [key, prefersReducedMotion]);

  if (!visible) return null;
  return (
    <div className="top-progress" style={{ width: `${width}%`, opacity }} />
  );
}
