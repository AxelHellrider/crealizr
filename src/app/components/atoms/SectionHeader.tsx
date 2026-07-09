import React from "react";

export function SectionHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <h2 className={`mb-6 font-serif text-xl accent-gold border-b border-gold/10 pb-3 uppercase tracking-wide break-words ${className}`}>
            {children}
        </h2>
    );
}
