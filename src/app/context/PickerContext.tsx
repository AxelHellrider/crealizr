"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface PickerOption {
    value: string;
    label: ReactNode;
}

export interface PickerConfig {
    value: string;
    options: PickerOption[];
    label?: string;
    onCommit: (value: string) => void;
}

interface PickerContextValue {
    config: PickerConfig | null;
    open: (config: PickerConfig) => void;
    close: () => void;
}

const PickerContext = createContext<PickerContextValue | null>(null);

export function PickerProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<PickerConfig | null>(null);

    const open = useCallback((cfg: PickerConfig) => setConfig(cfg), []);
    const close = useCallback(() => setConfig(null), []);

    return (
        <PickerContext.Provider value={{ config, open, close }}>
            {children}
        </PickerContext.Provider>
    );
}

export function usePicker() {
    return useContext(PickerContext);
}
