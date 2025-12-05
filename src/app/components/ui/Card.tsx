import React from "react";

export const Card = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
    ({ children }, ref) => (
        <div ref={ref} className="bg-zinc-900 border border-zinc-700 rounded-xl shadow p-4">
            {children}
        </div>
    )
);
Card.displayName = "Card";

export function CardContent({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-2">{children}</div>;
}
