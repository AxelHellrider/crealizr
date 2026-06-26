import React from "react";

interface SubLabelProps {
    children: React.ReactNode;
    variant?: "gold" | "muted";
    className?: string;
}

export function SubLabel({ children, variant = "gold", className = "" }: SubLabelProps) {
    const color = variant === "muted" ? "text-muted" : "text-gold/70";
    return (
        <div className={`text-xs uppercase tracking-[0.2em] ${color} font-bold ${className}`}>
            {children}
        </div>
    );
}
