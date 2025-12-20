"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full">
            <div className="page-wrap glass-panel flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <Link href="/" className="text-xl font-semibold accent-orange">
                    CRealizr
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm">
                    <Link className="ui-link transition" href="/scale">
                        CR Scaler
                    </Link>
                    <Link className="ui-link transition" href="/balance">
                        Combat Balancer
                    </Link>
                    <Link className="ui-link transition" href="/items">
                        Item Creator
                    </Link>

                    <a
                        href="https://github.com/AxelHellrider"
                        target="_blank"
                        rel="noreferrer"
                        className="ui-button"
                    >
                        GitHub
                    </a>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden ui-button px-3 py-2"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                >
                    {/* Hamburger / Close */}
                    <span className="sr-only">Menu</span>
                    <div className="flex flex-col gap-1">
                        <span className={`block h-0.5 w-5 bg-current transition ${open ? "rotate-45 translate-y-1.5" : ""}`} />
                        <span className={`block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
                        <span className={`block h-0.5 w-5 bg-current transition ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
                    </div>
                </button>
            </div>

            {/* Mobile Menu Panel */}
            {open && (
                <div className="md:hidden glass-panel border-t border-white/10">
                    <nav className="flex flex-col gap-2 px-4 py-4 text-sm">
                        <Link
                            href="/scale"
                            className="ui-link"
                            onClick={() => setOpen(false)}
                        >
                            CR Scaler
                        </Link>
                        <Link
                            href="/balance"
                            className="ui-link"
                            onClick={() => setOpen(false)}
                        >
                            Combat Balancer
                        </Link>
                        <Link
                            href="/items"
                            className="ui-link"
                            onClick={() => setOpen(false)}
                        >
                            Item Creator
                        </Link>

                        <a
                            href="https://github.com/AxelHellrider"
                            target="_blank"
                            rel="noreferrer"
                            className="ui-button mt-2 text-center"
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
