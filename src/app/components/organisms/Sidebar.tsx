"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useTheme } from "@/app/context/ThemeContext";
import { useSidebar } from "@/app/context/SidebarContext";
import LanguageSwitcher from "@/app/components/atoms/LanguageSwitcher";
import { SEASONAL_THEMES, type Season } from "@/app/lib/seasonalThemes";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const { isOpen, setIsOpen } = useSidebar();
  const { season, setSeason } = useTheme();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: `/${locale}`, label: "Home", icon: "🏠" },
    { href: `/${locale}/encounter-builder`, label: "Encounter Builder", icon: "⚔️" },
    { href: `/${locale}/monster-scaler`, label: "Monster Scaler", icon: "⚖️" },
    { href: `/${locale}/travel-encounters`, label: "Travel Encounters", icon: "🗺️" },
    { href: `/${locale}/artifact-forge`, label: "Artifact Forge", icon: "✨" },
    { href: `/${locale}/contact`, label: "Contact", icon: "📧" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`
          fixed left-0 top-0 h-screen w-72 bg-card border-r border-gold/20 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="text-right p-6 border-b border-gold/20">
          <Link href={`/${locale}`} className="text-2xl font-serif accent-gold">
            CRealizr
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-semibold tracking-widest ui-link transition hover:bg-gold/10"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="uppercase">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gold/20 space-y-4">
          {/* Language Switcher */}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-gold/60 font-bold mb-2 block">
              Language
            </label>
            <LanguageSwitcher />
          </div>

          {/* Season Selector */}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-gold/60 font-bold mb-2 block">
              Season
            </label>
            {mounted && (
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SEASONAL_THEMES) as Season[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeason(s)}
                    className={`px-3 py-2 text-xs uppercase tracking-wider border rounded-sm transition-colors ${
                      season === s
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-gold/20 hover:bg-gold/5 text-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/AxelHellrider"
            target="_blank"
            rel="noreferrer"
            className="ui-button w-full text-center text-xs uppercase tracking-widest"
          >
            GitHub
          </a>
        </div>
      </aside>
    </>
  );
}
