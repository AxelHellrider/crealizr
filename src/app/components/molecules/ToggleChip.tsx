"use client";

import React from "react";

type ToggleChipSize = "xs" | "sm" | "lg";

interface ToggleChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isActive: boolean;
    size?: ToggleChipSize;
    children: React.ReactNode;
}

const sizeClasses: Record<ToggleChipSize, string> = {
    xs: "px-2 py-0.5 text-[10px]",
    sm: "px-3 py-1.5 text-xs",
    lg: "flex-1 px-4 py-3 text-sm text-center",
};

export function ToggleChip({ isActive, size = "sm", children, className = "", ...props }: ToggleChipProps) {
    const base = `uppercase tracking-widest border rounded-sm transition-colors cursor-pointer ${sizeClasses[size]}`;
    const active = "border-gold bg-gold/10 text-gold shadow-[0_0_6px_rgba(197,160,89,0.2)]";
    const inactive = "border-gold/20 text-muted hover:bg-gold/5 hover:text-gold hover:border-gold/40 active:scale-95";

    return (
        <button
            type="button"
            aria-pressed={isActive}
            className={`${base} ${isActive ? active : inactive} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
