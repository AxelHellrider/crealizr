import React from "react";

interface EmptyStateProps {
    message: string;
    className?: string;
}

export function EmptyState({ message, className = "" }: EmptyStateProps) {
    return (
        <div className={`py-12 text-center border border-gold/10 rounded-sm ${className}`}>
            <p className="text-muted text-sm italic">{message}</p>
        </div>
    );
}
