"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export type HeroSlide = {
    href?: string;
    accent: "gold" | "silver";
    kicker: string;
    title: string;
    description: string;
    action?: string;
    icon: React.ReactNode;
    preview?: React.ReactNode;
};

const AUTO_ADVANCE_MS = 4000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const timer = useRef<number | null>(null);

    const [prefersReducedMotion] = useState(
        () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );

    const advance = useCallback(() => {
        setIndex((i) => (i + 1) % slides.length);
    }, [slides.length]);

    // Auto-advance indefinitely — loops forever, pauses on hover/focus so it doesn't fight the user.
    useEffect(() => {
        if (paused || prefersReducedMotion || slides.length <= 1) return;
        timer.current = window.setInterval(advance, AUTO_ADVANCE_MS);
        return () => { if (timer.current) window.clearInterval(timer.current); };
    }, [paused, prefersReducedMotion, advance, slides.length]);

    const slide = slides[index];
    const accentClasses = slide.accent === "gold"
        ? { text: "text-gold", kicker: "text-gold/50", border: "border-gold/15" }
        : { text: "text-silver", kicker: "text-silver/50", border: "border-silver/15" };

    const body = (
        <div className="relative z-10 flex flex-col items-center text-center gap-5 max-w-2xl px-4">
            <span className={`text-[10px] uppercase tracking-[0.35em] font-bold ${accentClasses.kicker}`}>{slide.kicker}</span>
            <h2 className="font-serif text-2xl lg:text-4xl uppercase tracking-tight text-foreground">{slide.title}</h2>
            <p className="text-muted-foreground text-sm lg:text-lg leading-relaxed font-light">{slide.description}</p>
            {slide.preview && <div className="py-3">{slide.preview}</div>}
            {slide.action && (
                <div className={`text-xs font-bold flex items-center gap-3 uppercase tracking-widest ${accentClasses.text}`}>
                    {slide.action} <span>&rarr;</span>
                </div>
            )}
        </div>
    );

    return (
        <div
            className="relative w-full overflow-hidden min-h-[calc(100svh-3.5rem)] flex flex-col items-center justify-center"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <div className={`absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none ${accentClasses.text}`} aria-hidden="true">
                        <div className="w-[60vmin] h-[60vmin]">{slide.icon}</div>
                    </div>
                    {slide.href ? (
                        <Link href={slide.href} scroll={false} className="contents">
                            {body}
                        </Link>
                    ) : body}
                </motion.div>
            </AnimatePresence>

            {/* Slide indicators — flat segments, single crimson accent for the active slide */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {slides.map((s, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`Show slide ${i + 1}: ${s.title}`}
                        aria-current={i === index}
                        className={`h-1.5 w-6 border transition-colors ${
                            i === index ? "bg-crimson border-crimson" : "bg-transparent border-gold/30 hover:border-gold/60"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
