"use client";

import { motion } from "framer-motion";

export interface SliderToggleOption<T extends string> {
    value: T;
    icon: React.ReactNode;
    title?: string;
}

interface SliderToggleProps<T extends string> {
    value: T;
    options: [SliderToggleOption<T>, SliderToggleOption<T>];
    onChange: (value: T) => void;
}

export function SliderToggle<T extends string>({ value, options, onChange }: SliderToggleProps<T>) {
    const activeIndex = options[0].value === value ? 0 : 1;
    const activeLabel = options[activeIndex].title;

    return (
        <div className="flex flex-col gap-1">
            <div className="relative inline-flex w-full rounded-sm border border-gold/20 bg-background/60 p-0.5">
                <motion.div
                    className="absolute top-0.5 bottom-0.5 rounded-sm bg-gold/15 border border-gold/30"
                    animate={{ left: activeIndex === 0 ? "2px" : "50%", width: "calc(50% - 2px)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        title={opt.title}
                        aria-pressed={value === opt.value}
                        className={`relative z-10 flex flex-1 items-center justify-center py-2 transition-colors duration-150 ${
                            value === opt.value ? "text-gold" : "text-muted hover:text-foreground"
                        }`}
                    >
                        {opt.icon}
                    </button>
                ))}
            </div>
            {activeLabel && (
                <span className="text-[10px] uppercase tracking-[0.15em] text-gold/60 font-bold text-center">
                    {activeLabel}
                </span>
            )}
        </div>
    );
}
