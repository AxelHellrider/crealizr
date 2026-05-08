"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LanguageSwitcher from "@/app/components/atoms/LanguageSwitcher";
import {useLocale} from 'next-intl';

export default function Header() {
    const [open, setOpen] = useState(false);
    const locale = useLocale();

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
                <Link href={`/${locale}`} className="text-2xl font-serif accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm">
                    CRealizr
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden xl:flex items-center gap-8 text-sm font-semibold tracking-widest" aria-label="Main Navigation">
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm" href={`/${locale}/encounter-builder`}>
                        ENCOUNTER BUILDER
                    </Link>
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm" href={`/${locale}/monster-scaler`}>
                        MONSTER SCALER
                    </Link>
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm" href={`/${locale}/travel-encounters`}>
                        TRAVEL ENCOUNTERS
                    </Link>
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm" href={`/${locale}/artifact-forge`}>
                        ARTIFACT FORGE
                    </Link>

                    <div className="flex items-center gap-4 ml-4">
                        <LanguageSwitcher />
                        <Link
                            href={`/${locale}/contact`}
                            className="hidden lg:block ui-button px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                        >
                            Contact
                        </Link>
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
                <div className="flex items-center gap-4 xl:hidden">
                    <LanguageSwitcher />
                    <Link
                        href={`/${locale}/contact`}
                        className="ui-button px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                    >
                        Contact
                    </Link>
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
                <div id="mobile-menu" className="xl:hidden glass-panel border-t border-gold/10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col gap-2 px-4 py-4 text-sm font-semibold tracking-widest" aria-label="Mobile Navigation">
                        <Link
                            href={`/${locale}/encounter-builder`}
                            className="ui-link p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            ENCOUNTER BUILDER
                        </Link>
                        <Link
                            href={`/${locale}/monster-scaler`}
                            className="ui-link p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            MONSTER SCALER
                        </Link>
                        <Link
                            href={`/${locale}/travel-encounters`}
                            className="ui-link p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            TRAVEL ENCOUNTERS
                        </Link>
                        <Link
                            href={`/${locale}/artifact-forge`}
                            className="ui-link p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            ARTIFACT FORGE
                        </Link>

                        <Link
                            href={`/${locale}/contact`}
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
