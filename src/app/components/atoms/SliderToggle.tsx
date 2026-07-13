"use client";

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

/** Flat segmented toggle — replaces the old sliding-pill indicator. */
export function SliderToggle<T extends string>({ value, options, onChange }: SliderToggleProps<T>) {
    const activeIndex = options[0].value === value ? 0 : 1;
    const activeLabel = options[activeIndex].title;

    return (
        <div className="flex flex-col gap-1">
            <div className="ui-segment-group">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        title={opt.title}
                        aria-pressed={value === opt.value}
                        className="ui-segment flex items-center justify-center"
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
