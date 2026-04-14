import React from "react";

/**
 * Molecule: FormField
 * Combines a label with an input or select element.
 * Consistent typography and spacing for high-fantasy UI.
 */
interface FormFieldProps {
    label: string;
    children: React.ReactNode;
    className?: string;
    sublabel?: string;
}

export function FormField({ label, children, className = "", sublabel }: FormFieldProps) {
    return (
        <div className={`grid gap-1.5 ${className}`}>
            <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-muted">
                    {label}
                    {sublabel && <span className="ml-2 lowercase font-normal italic opacity-70">({sublabel})</span>}
                </span>
                {children}
            </label>
        </div>
    );
}
