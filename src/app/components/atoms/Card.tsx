import React from "react";

/**
 * Atomic Card component
 * FFXIV-inspired "neo-card" with silver/gold decorative accents.
 */
export const Card = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
    ({ children, className = "" }, ref) => (
        <div ref={ref} className={`neo-card p-4 bg-card border-silver/10 ${className}`}>
            {children}
        </div>
    )
);
Card.displayName = "Card";

/**
 * CardContent Atom
 * Provides standard spacing and layout for card internals.
 */
export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`flex flex-col gap-2 ${className}`}>{children}</div>;
}
