"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
    const [open, setOpen] = useState(false);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-white/5">
            <div className="w-full flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="text-xl font-semibold accent-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 rounded-sm">
                    CRealizr
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Main Navigation">
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-sm" href="/scale">
                        CR Scaler
                    </Link>
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-sm" href="/balance">
                        Combat Balancer
                    </Link>
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-sm" href="/encounters-en-route">
                        Encounters en route
                    </Link>
                    <Link className="ui-link transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-sm" href="/items">
                        Item Creator
                    </Link>

                    <a
                        href="https://github.com/AxelHellrider"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex ui-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                    >
                        GitHub
                    </a>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="inline-flex ui-button px-3 py-2 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    onClick={() => setOpen((v) => !v)}
                >
                    {/* Hamburger / Close */}
                    <div className="flex flex-col gap-1" aria-hidden="true">
                        <span className={`block h-0.5 w-5 bg-current transition ${open ? "rotate-45 translate-y-1.5" : ""}`} />
                        <span className={`block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
                        <span className={`block h-0.5 w-5 bg-current transition ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
                    </div>
                </button>
            </div>

            {/* Mobile Menu Panel */}
            {open && (
                <div id="mobile-menu" className="md:hidden glass-panel border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col gap-2 px-4 py-4 text-sm" aria-label="Mobile Navigation">
                        <Link
                            href="/scale"
                            className="ui-link p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            CR Scaler
                        </Link>
                        <Link
                            href="/balance"
                            className="ui-link p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            Combat Balancer
                        </Link>
                        <Link
                            href="/encounters-en-route"
                            className="ui-link p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            Encounters en route
                        </Link>
                        <Link
                            href="/items"
                            className="ui-link p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-sm"
                            onClick={() => setOpen(false)}
                        >
                            Item Creator
                        </Link>

                        <a
                            href="https://github.com/AxelHellrider"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex ui-button mt-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
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
