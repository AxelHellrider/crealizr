import React from "react";

/**
 * Atomic Input component
 * Optimized for fast CSS paints and high-contrast accessibility.
 * FFXIV-inspired focus states with gold/silver accents.
 */
type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
    return (
        <input
            {...props}
            className={`ui-input w-full min-h-11 sm:min-h-[38px] transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold 
            bg-bg-elev border-silver/30 text-foreground
            ${className || ""}`}
        />
    );
}
