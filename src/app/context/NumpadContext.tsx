"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";

export interface NumpadConfig {
    value: number;
    label?: string;
    min?: number;
    max?: number;
    allowNegative?: boolean;
    onCommit: (value: number) => void;
}

interface NumpadContextValue {
    config: NumpadConfig | null;
    displayValue: string;
    open: (config: NumpadConfig) => void;
    close: () => void;
    append: (digit: string) => void;
    backspace: () => void;
    toggleSign: () => void;
    commit: () => void;
}

const NumpadContext = createContext<NumpadContextValue | null>(null);

export function NumpadProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<NumpadConfig | null>(null);
    const [displayValue, setDisplayValue] = useState("0");
    const freshRef = useRef(false);

    const open = useCallback((cfg: NumpadConfig) => {
        setConfig(cfg);
        setDisplayValue(String(cfg.value));
        freshRef.current = true;
    }, []);

    const close = useCallback(() => {
        setConfig(null);
    }, []);

    const append = useCallback((digit: string) => {
        setDisplayValue((prev) => {
            if (freshRef.current) {
                freshRef.current = false;
                // preserve sign if present
                const sign = prev.startsWith("-") ? "-" : "";
                return sign + digit;
            }
            if (prev === "0" || prev === "-0") return prev.startsWith("-") ? "-" + digit : digit;
            return prev + digit;
        });
    }, []);

    const backspace = useCallback(() => {
        freshRef.current = false;
        setDisplayValue((prev) => {
            const stripped = prev.length <= 1 || (prev.length === 2 && prev[0] === "-");
            return stripped ? "0" : prev.slice(0, -1);
        });
    }, []);

    const toggleSign = useCallback(() => {
        setDisplayValue((prev) => {
            if (prev === "0") return "0";
            return prev.startsWith("-") ? prev.slice(1) : "-" + prev;
        });
    }, []);

    const commit = useCallback(() => {
        if (!config) return;
        const raw = displayValue === "" || displayValue === "-" ? "0" : displayValue;
        let num = Number(raw) || 0;
        if (config.min !== undefined) num = Math.max(config.min, num);
        if (config.max !== undefined) num = Math.min(config.max, num);
        config.onCommit(num);
        close();
    }, [config, displayValue, close]);

    return (
        <NumpadContext.Provider value={{ config, displayValue, open, close, append, backspace, toggleSign, commit }}>
            {children}
        </NumpadContext.Provider>
    );
}

export function useNumpad() {
    return useContext(NumpadContext);
}
