import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    rows?: number;
}

export function Textarea({ className = "", rows = 4, ...props }: TextareaProps) {
    return (
        <textarea
            rows={rows}
            className={`ui-input w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold ${className}`}
            {...props}
        />
    );
}
