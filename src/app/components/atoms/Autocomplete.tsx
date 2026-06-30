"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

type SingleProps = {
    multiple?: false;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
};

type MultiProps = {
    multiple: true;
    value: string[];
    onChange: (value: string[]) => void;
    options: string[];
    placeholder?: string;
    className?: string;
};

type Props = SingleProps | MultiProps;

export function Autocomplete(props: Props) {
    const { multiple, options, placeholder, className } = props;
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selected = multiple ? props.value : [];

    const filtered = query
        ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
        : options;

    const updatePosition = useCallback(() => {
        if (!inputRef.current) return;
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownStyle({
            position: "fixed",
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
        });
    }, []);

    useEffect(() => {
        if (!open) return;
        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node;
            if (
                wrapperRef.current && !wrapperRef.current.contains(target) &&
                listRef.current && !listRef.current.contains(target)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setActiveIndex(-1);
    }, [query]);

    function selectOption(option: string) {
        if (multiple) {
            const cur = props.value;
            props.onChange(
                cur.includes(option) ? cur.filter((v) => v !== option) : [...cur, option]
            );
        } else {
            props.onChange(option);
            setQuery("");
            setOpen(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!open || filtered.length === 0) {
            if (e.key === "ArrowDown") { setOpen(true); e.preventDefault(); }
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % filtered.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            selectOption(filtered[activeIndex]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }

    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
            item?.scrollIntoView({ block: "nearest" });
        }
    }, [activeIndex]);

    const inputValue = multiple ? query : (props.value || query);

    function isSelected(option: string) {
        if (multiple) return selected.includes(option);
        return option === props.value;
    }

    const dropdown = open && filtered.length > 0 && createPortal(
        <ul
            ref={listRef}
            role="listbox"
            style={{ ...dropdownStyle, background: "var(--surface-raised)" }}
            className="z-[9999] max-h-48 overflow-y-auto border border-gold/20 rounded-sm shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
            {filtered.map((option, i) => (
                <li
                    key={option}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseDown={() => selectOption(option)}
                    className={`px-3 py-2 text-sm cursor-pointer capitalize transition-colors flex items-center justify-between ${
                        i === activeIndex
                            ? "bg-gold/15 text-gold"
                            : isSelected(option)
                              ? "text-gold"
                              : "text-muted hover:bg-gold/5"
                    }`}
                >
                    {option}
                    {isSelected(option) && <span className="text-gold">&#10003;</span>}
                </li>
            ))}
        </ul>,
        document.body
    );

    return (
        <div ref={wrapperRef}>
            {multiple && selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {selected.map((v) => (
                        <span
                            key={v}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs uppercase tracking-widest border border-gold bg-gold/10 text-gold rounded-sm"
                        >
                            {v}
                            <button
                                type="button"
                                aria-label={`Remove ${v}`}
                                onMouseDown={(e) => { e.preventDefault(); props.onChange(selected.filter((s) => s !== v)); }}
                                className="hover:text-red-400 transition-colors ml-0.5"
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                    if (multiple) {
                        setQuery(e.target.value);
                    } else {
                        props.onChange(e.target.value);
                    }
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                role="combobox"
                aria-expanded={open && filtered.length > 0}
                aria-autocomplete="list"
                className={`ui-input w-full min-h-11 lg:min-h-[38px] transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold
                    bg-surface border-silver/30 text-foreground
                    ${className || ""}`}
            />
            {dropdown}
        </div>
    );
}
