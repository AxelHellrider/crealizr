import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
    return (
        <input
            {...props}
            className={`ui-input w-full min-h-11 sm:min-h-[38px] transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 
            ${className || ""}`}
        />
    );
}
