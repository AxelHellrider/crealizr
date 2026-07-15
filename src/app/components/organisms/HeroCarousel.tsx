"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

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

const AUTO_ADVANCE_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    // Starts true to match the server-rendered state (the hero is the page's
    // LCP element and must be visible in the very first paint). Slide
    // *changes* after mount briefly flip this off/on to retrigger the CSS
    // crossfade below — see the effect further down.
    const [entered, setEntered] = useState(true);
    const timer = useRef<number | null>(null);
    const isFirstIndexRender = useRef(true);

    const [prefersReducedMotion] = useState(
        () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );

    const advance = useCallback(() => {
        setIndex((i) => (i + 1) % slides.length);
    }, [slides.length]);

    const goPrev = useCallback(() => {
        setIndex((i) => (i - 1 + slides.length) % slides.length);
    }, [slides.length]);

    const goNext = useCallback(() => {
        setIndex((i) => (i + 1) % slides.length);
    }, [slides.length]);

    // Auto-advance indefinitely — loops forever, pauses on hover/focus so it doesn't fight the user.
    useEffect(() => {
        if (paused || prefersReducedMotion || slides.length <= 1) return;
        timer.current = window.setInterval(advance, AUTO_ADVANCE_MS);
        return () => { if (timer.current) window.clearInterval(timer.current); };
    }, [paused, prefersReducedMotion, advance, slides.length]);

    // Plain CSS crossfade instead of framer-motion — the hero is above the
    // fold and was previously shipping an animation library's full client
    // bundle just to fade in text. Flip `entered` off then back on a tick
    // later so the opacity/transform classes below actually transition
    // instead of jumping straight to their end state.
    useEffect(() => {
        if (isFirstIndexRender.current) {
            isFirstIndexRender.current = false;
            return;
        }
        if (prefersReducedMotion) return;
        // Deferred into setTimeout (rather than called synchronously in the
        // effect body) to avoid a cascading-render lint warning — same
        // pattern used in RouteProgress.tsx.
        const resetTimer = window.setTimeout(() => setEntered(false), 0);
        const settleTimer = window.setTimeout(() => setEntered(true), 20);
        return () => {
            window.clearTimeout(resetTimer);
            window.clearTimeout(settleTimer);
        };
    }, [index, prefersReducedMotion]);

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
            <div
                className={`absolute inset-0 flex flex-col items-center justify-center transition-[opacity,transform] duration-[400ms] ease-out ${
                    entered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
                }`}
            >
                <div className={`absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none ${accentClasses.text}`} aria-hidden="true">
                    <div className="w-[60vmin] h-[60vmin]">{slide.icon}</div>
                </div>
                {slide.href ? (
                    <Link href={slide.href} scroll={false} className="contents">
                        {body}
                    </Link>
                ) : body}
            </div>

            {slides.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={goPrev}
                        aria-label="Previous slide"
                        className="group absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-gold/50 hover:text-gold transition-colors duration-300 focus-visible:outline-none focus-visible:text-gold"
                        style={{ filter: "drop-shadow(0 0 6px rgba(197,160,89,0.25))" }}
                    >
                        <svg
                            viewBox="0 0 40 40" width="32" height="32" className="sm:w-10 sm:h-10 transition-transform duration-300 group-hover:-translate-x-1.5"
                            fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                        >
                            <path d="M26 8 L14 20 L26 32" />
                            <path d="M14 20 Q22 20 32 20" strokeWidth="0.75" opacity="0.5" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={goNext}
                        aria-label="Next slide"
                        className="group absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-gold/50 hover:text-gold transition-colors duration-300 focus-visible:outline-none focus-visible:text-gold"
                        style={{ filter: "drop-shadow(0 0 6px rgba(197,160,89,0.25))" }}
                    >
                        <svg
                            viewBox="0 0 40 40" width="32" height="32" className="sm:w-10 sm:h-10 transition-transform duration-300 group-hover:translate-x-1.5"
                            fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                        >
                            <path d="M14 8 L26 20 L14 32" />
                            <path d="M26 20 Q18 20 8 20" strokeWidth="0.75" opacity="0.5" />
                        </svg>
                    </button>
                </>
            )}

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
