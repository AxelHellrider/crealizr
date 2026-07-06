"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePicker, type PickerOption } from "@/app/context/PickerContext";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Atomic Select component.
 *
 * Desktop (md+): a real <select> — mouse/keyboard users get a fine native
 * dropdown and there's no touch-scroll affordance to gain.
 * Mobile (<md): a combobox-style trigger button that opens the app-wide
 * bottom-sheet Picker (see Picker.tsx / PickerContext.tsx) for a
 * Numpad-matching, touch-friendly wheel instead of the OS default.
 *
 * Only one of the two is ever mounted (not just CSS-hidden) so there's a
 * single interactive element at a time — SSR defaults to the native
 * <select> and swaps post-mount via matchMedia if the viewport is mobile.
 */
export function Select({ children, className = "", value, onChange, disabled, "aria-label": ariaLabel, ...rest }: SelectProps) {
    const picker = usePicker();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(MOBILE_QUERY);
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    const { allOptions, selectableOptions, currentLabel } = useMemo(() => {
        const all: (PickerOption & { disabled?: boolean })[] = [];
        React.Children.forEach(children, (child) => {
            if (!React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child)) return;
            const v = child.props.value != null ? String(child.props.value) : "";
            all.push({ value: v, label: child.props.children, disabled: child.props.disabled });
        });
        const selectable = all.filter(o => !o.disabled);
        const current = all.find(o => o.value === String(value ?? ""));
        return { allOptions: all, selectableOptions: selectable, currentLabel: current?.label };
    }, [children, value]);

    if (!isMobile) {
        return (
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                aria-label={ariaLabel}
                className={`ui-select w-full min-h-11 sm:min-h-[38px] transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold
                bg-surface border-silver/30 text-foreground
                ${className}`}
                {...rest}
            >
                {children}
            </select>
        );
    }

    const openPicker = () => {
        if (disabled || !picker) return;
        picker.open({
            value: String(value ?? ""),
            options: selectableOptions,
            label: ariaLabel,
            onCommit: (next) => {
                onChange?.({ target: { value: next } } as unknown as React.ChangeEvent<HTMLSelectElement>);
            },
        });
    };

    return (
        <button
            type="button"
            role="combobox"
            aria-label={ariaLabel}
            aria-haspopup="listbox"
            aria-expanded={!!picker?.config}
            disabled={disabled}
            onClick={openPicker}
            className={`ui-select w-full min-h-11 flex items-center justify-between gap-2 text-left transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold
            bg-surface border-silver/30 text-foreground disabled:opacity-50 disabled:cursor-not-allowed
            ${className}`}
            {...(rest as Record<string, unknown>)}
        >
            <span className="truncate">{currentLabel ?? allOptions[0]?.label ?? ""}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-60" aria-hidden="true">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
}
