import React from "react";

export function PageSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <section className={`grid gap-8 glass-panel p-5 lg:p-12 fantasy-border lg:rounded-none lg:border-x-0 lg:border-t-0 ${className}`}>
            {children}
        </section>
    );
}
