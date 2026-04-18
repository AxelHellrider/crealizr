"use client";

export function WhyDifferent({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs uppercase tracking-[0.2em] text-gold/70 font-bold ${className}`}>
      Why this is different: DM-first tools with clear rules math, fantasy-forward presentation, and zero-login speed at the table.
    </p>
  );
}
