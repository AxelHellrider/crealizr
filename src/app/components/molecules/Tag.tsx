"use client";

import React from "react";

interface TagProps {
    children: React.ReactNode;
    onRemove?: () => void;
    className?: string;
}

export function Tag({ children, onRemove, className = "" }: TagProps) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-sm border border-gold/20 bg-gold/5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest accent-gold shadow-glow ${className}`}>
            {children}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-gold/90 hover:text-red-400 ml-2 transition-colors text-base leading-none"
                    aria-label="Remove"
                >
                    ×
                </button>
            )}
        </span>
    );
}
