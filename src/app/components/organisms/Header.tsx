"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/app/context/ThemeContext";

export default function Header() {
    const [open, setOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = window.setTimeout(() => setMounted(true), 0);
        return () => window.clearTimeout(t);
    }, []);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-gold/20">
            <div className="w-full flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="text-2xl font-serif accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm">
                    CRealizr
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-widest" aria-label="Main Navigation">
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm" href="/encounter-builder">
                        ENCOUNTER BUILDER
                    </Link>
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm" href="/monster-scaler">
                        MONSTER SCALER
                    </Link>
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm" href="/travel-encounters">
                        TRAVEL ENCOUNTERS
                    </Link>
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm" href="/artifact-forge">
                        ARTIFACT FORGE
                    </Link>

                    <div className="flex items-center gap-4 ml-4">
                        <Link
                            href="/contact"
                            className="lg:block hidden ui-button px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                        >
                            Contact
                        </Link>
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded border border-gold/20 hover:bg-gold/10 transition-colors text-gold"
                                aria-label="Toggle Theme"
                            >
                                {theme === "light" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                                )}
                            </button>
                        )}
                        <a
                            href="https://github.com/AxelHellrider"
                            target="_blank"
                            rel="noreferrer"
                            className="ui-button px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                        >
                            GitHub
                        </a>
                    </div>
                </nav>

                {/* Mobile Menu Button + Theme Toggle */}
                <div className="flex items-center gap-4 lg:hidden">
                    <Link
                        href="/contact"
                        className="ui-button px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                    >
                        Contact
                    </Link>
                    {mounted && (
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full border border-gold/20 text-gold"
                            aria-label="Toggle Theme"
                        >
                            {theme === "light" ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                            )}
                        </button>
                    )}
                    <button
                        className="inline-flex ui-button px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        onClick={() => setOpen((v) => !v)}
                    >
                        {/* Hamburger / Close */}
                        <div className="flex flex-col gap-1.5" aria-hidden="true">
                            <span className={`block h-0.5 w-6 bg-current transition ${open ? "rotate-45 translate-y-2" : ""}`} />
                            <span className={`block h-0.5 w-6 bg-current transition ${open ? "opacity-0" : ""}`} />
                            <span className={`block h-0.5 w-6 bg-current transition ${open ? "-rotate-45 -translate-y-2" : ""}`} />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            {open && (
                <div id="mobile-menu" className="lg:hidden glass-panel border-t border-gold/10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col gap-2 px-4 py-4 text-sm font-semibold tracking-widest" aria-label="Mobile Navigation">
                        <Link
                            href="/encounter-builder"
                            className="ui-link p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            ENCOUNTER BUILDER
                        </Link>
                        <Link
                            href="/monster-scaler"
                            className="ui-link p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            MONSTER SCALER
                        </Link>
                        <Link
                            href="/travel-encounters"
                            className="ui-link p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            TRAVEL ENCOUNTERS
                        </Link>
                        <Link
                            href="/artifact-forge"
                            className="ui-link p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            ARTIFACT FORGE
                        </Link>

                        <Link
                            href="/contact"
                            className="ui-button mt-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                            onClick={() => setOpen(false)}
                        >
                            Contact
                        </Link>

                        <a
                            href="https://github.com/AxelHellrider"
                            target="_blank"
                            rel="noreferrer"
                            className="ui-button mt-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                            onClick={() => setOpen(false)}
                        >
                            GitHub
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
}
