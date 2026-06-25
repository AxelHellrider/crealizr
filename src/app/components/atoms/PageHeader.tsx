import React from "react";

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
    return (
        <header className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-4 border-b border-gold/20 pb-6">
            <div>
                <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">{title}</h1>
                {description && <p className="text-muted mt-2 font-light italic">{description}</p>}
            </div>
            {children}
        </header>
    );
}
