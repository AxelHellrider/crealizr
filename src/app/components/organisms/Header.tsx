"use client";

import Link from "next/link";
import { useLocale } from 'next-intl';
import { useSidebar } from "@/app/context/SidebarContext";

export default function Header() {
    const locale = useLocale();
    const { isOpen, toggle } = useSidebar();

    return (
        <header className="sticky top-0 z-50 w-full bg-background border-b border-gold/20 xl:hidden">
            <div className="flex items-center justify-between px-4 py-3">
                <Link href={`/${locale}`} className="text-2xl font-serif accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm">
                    CRealizr
                </Link>
                <button
                    type="button"
                    onClick={toggle}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                    aria-controls="sidebar"
                    className="inline-flex ui-button px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                >
                    <div className="flex flex-col gap-1.5" aria-hidden="true">
                        <span className={`block h-0.5 w-6 bg-current transition ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <span className={`block h-0.5 w-6 bg-current transition ${isOpen ? "opacity-0" : ""}`} />
                        <span className={`block h-0.5 w-6 bg-current transition ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                    </div>
                </button>
            </div>

        </header>
    );
}
