import React from "react";

interface StatRowProps {
    label: string;
    children: React.ReactNode;
    valueClassName?: string;
}

export function StatRow({ label, children, valueClassName = "font-medium" }: StatRowProps) {
    return (
        <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 lg:flex-row lg:items-center lg:justify-between">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">{label}:</span>
            <span className={`break-words lg:text-right ${valueClassName}`}>{children}</span>
        </div>
    );
}
