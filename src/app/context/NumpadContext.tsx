"use client";

import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";

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

/** `fresh` marks that the display still shows the seed value from `open()` — the next digit replaces it instead of appending. */
type NumpadState = {
    config: NumpadConfig | null;
    displayValue: string;
    fresh: boolean;
};

type NumpadAction =
    | { type: "OPEN"; config: NumpadConfig }
    | { type: "CLOSE" }
    | { type: "APPEND"; digit: string }
    | { type: "BACKSPACE" }
    | { type: "TOGGLE_SIGN" };

const initialState: NumpadState = { config: null, displayValue: "0", fresh: false };

function numpadReducer(state: NumpadState, action: NumpadAction): NumpadState {
    switch (action.type) {
        case "OPEN":
            return { config: action.config, displayValue: String(action.config.value), fresh: true };
        case "CLOSE":
            return { ...state, config: null };
        case "APPEND": {
            const prev = state.displayValue;
            if (state.fresh) {
                const sign = prev.startsWith("-") ? "-" : "";
                return { ...state, displayValue: sign + action.digit, fresh: false };
            }
            if (prev === "0" || prev === "-0") {
                return { ...state, displayValue: prev.startsWith("-") ? "-" + action.digit : action.digit };
            }
            return { ...state, displayValue: prev + action.digit };
        }
        case "BACKSPACE": {
            const prev = state.displayValue;
            const stripped = prev.length <= 1 || (prev.length === 2 && prev[0] === "-");
            return { ...state, fresh: false, displayValue: stripped ? "0" : prev.slice(0, -1) };
        }
        case "TOGGLE_SIGN": {
            const prev = state.displayValue;
            if (prev === "0") return state;
            return { ...state, displayValue: prev.startsWith("-") ? prev.slice(1) : "-" + prev };
        }
        default:
            return state;
    }
}

export function NumpadProvider({ children }: { children: ReactNode }) {
    const [{ config, displayValue }, dispatch] = useReducer(numpadReducer, initialState);

    const open = useCallback((cfg: NumpadConfig) => dispatch({ type: "OPEN", config: cfg }), []);
    const close = useCallback(() => dispatch({ type: "CLOSE" }), []);
    const append = useCallback((digit: string) => dispatch({ type: "APPEND", digit }), []);
    const backspace = useCallback(() => dispatch({ type: "BACKSPACE" }), []);
    const toggleSign = useCallback(() => dispatch({ type: "TOGGLE_SIGN" }), []);

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
