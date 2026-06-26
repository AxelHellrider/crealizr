"use client";

import React, { useState, useEffect } from "react";
import { useNumpad } from "@/app/context/NumpadContext";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    /** Label shown inside the numpad header on mobile. Falls back to aria-label or placeholder. */
    numpadLabel?: string;
};

const BASE_CLASS = `ui-input w-full min-h-11 lg:min-h-[38px] transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold
    bg-surface border-silver/30 text-foreground`;

export function Input({ className, type, value, onChange, min, max, onFocus, numpadLabel, ...props }: InputProps) {
    const [isTouch, setIsTouch] = useState(false);
    useEffect(() => {
        setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    }, []);

    const numpad = useNumpad();

    if (type === "number" && isTouch && numpad) {
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            numpad.open({
                value: Number(value ?? 0),
                label: numpadLabel ?? (props["aria-label"] as string | undefined) ?? (props.placeholder as string | undefined),
                min: min !== undefined ? Number(min) : undefined,
                max: max !== undefined ? Number(max) : undefined,
                allowNegative: min === undefined || Number(min) < 0,
                onCommit: (val) => {
                    onChange?.({
                        target: { value: String(val) } as EventTarget & HTMLInputElement,
                    } as React.ChangeEvent<HTMLInputElement>);
                },
            });
            onFocus?.(e);
        };

        return (
            <input
                {...props}
                type="text"
                inputMode="none"
                value={value ?? ""}
                readOnly
                onFocus={handleFocus}
                className={`${BASE_CLASS} cursor-pointer ${className || ""}`}
            />
        );
    }

    return (
        <input
            {...props}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            min={min}
            max={max}
            className={`${BASE_CLASS} ${className || ""}`}
        />
    );
}
