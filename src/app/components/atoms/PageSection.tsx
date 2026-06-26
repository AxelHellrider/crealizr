import React from "react";

export function PageSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <section className={`grid gap-6 glass-panel p-4 lg:p-8 fantasy-border lg:rounded-none lg:border-x-0 lg:border-t-0 ${className}`}>
            {children}
        </section>
    );
}
