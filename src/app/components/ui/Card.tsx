import React from "react";

export const Card = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
    ({ children }, ref) => (
        <div ref={ref} className="neo-card p-4">
            {children}
        </div>
    )
);
Card.displayName = "Card";

export function CardContent({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-2">{children}</div>;
}
