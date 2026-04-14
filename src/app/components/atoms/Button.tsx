import React from "react";

/**
 * Atomic Button component
 * Follows FFXIV-inspired styling with Stormblood Crimson and Gold accents.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary";
}

export function Button({ children, className = "", variant = "secondary", ...props }: ButtonProps) {
    const variantClasses = variant === "primary" ? "ui-button-primary" : "";
    
    return (
        <button
            {...props}
            className={`inline-flex items-center justify-center ui-button min-h-[44px] sm:min-h-[38px] active:scale-95 touch-manipulation transition-all duration-200 ${variantClasses} ${className}`}
        >
            {children}
        </button>
    );
}
