import React from "react";

interface FilterBadgeProps {
    children: React.ReactNode;
    active?: boolean;
    className?: string;
}

export function FilterBadge({ children, active = false, className = "" }: FilterBadgeProps) {
    return (
        <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold ${
            active ? "border-gold/40 bg-gold/10 text-gold" : "border-gold/20 text-gold/60"
        } ${className}`}>
            {children}
        </span>
    );
}
