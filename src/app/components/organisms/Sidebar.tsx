"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "@/app/context/ThemeContext";
import { useSidebar } from "@/app/context/SidebarContext";
import LanguageSwitcher from "@/app/components/atoms/LanguageSwitcher";
import { SEASONAL_THEMES, type Season } from "@/app/lib/seasonalThemes";
import { ToggleChip } from "@/app/components/molecules/ToggleChip";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const { isOpen, setIsOpen } = useSidebar();
  const { season, setSeason } = useTheme();
  const locale = useLocale();
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      href: `/${locale}`,
      label: t("nav.home"),
      icon: (
        <svg viewBox="0 0 28 28" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 11 L14 1 L26 11 M5 9 V25 H23 V9"/>
          <rect x="11" y="16" width="6" height="9"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/encounter-builder`,
      label: t("nav.encounterBuilder"),
      icon: (
        <svg viewBox="0 0 28 28" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3 L25 25 M3 3 L9 3 L3 9 M25 25 L25 19 L19 25"/>
          <path d="M25 3 L3 25 M25 3 L19 3 L25 9 M3 25 L3 19 L9 25"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/monster-scaler`,
      label: t("nav.monsterScaler"),
      icon: (
        <svg viewBox="0 0 28 28" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="14" y1="2" x2="14" y2="22"/>
          <line x1="4" y1="8" x2="24" y2="8"/>
          <path d="M4 8 L0 17 Q4 21 8 17 Z"/>
          <path d="M24 8 L20 17 Q24 21 28 17 Z"/>
          <line x1="8" y1="25" x2="20" y2="25"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/travel-encounters`,
      label: t("nav.travelEncounters"),
      icon: (
        <svg viewBox="0 0 28 28" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <circle cx="14" cy="14" r="12"/>
          <polygon points="19,8 12,15 9,20 16,13"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/artifact-forge`,
      label: t("nav.artifactForge"),
      icon: (
        <svg viewBox="0 0 28 28" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <polygon points="14,1 21,9 14,27 7,9"/>
          <line x1="7" y1="9" x2="21" y2="9"/>
          <line x1="14" y1="1" x2="14" y2="27" strokeWidth="1" opacity="0.5"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/my-monsters`,
      label: t("nav.myMonsters"),
      icon: (
        <svg viewBox="0 0 28 28" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M2 4 Q11 1 14 6 Q17 1 26 4 V23 Q17 20 14 25 Q11 20 2 23 Z"/>
          <line x1="14" y1="6" x2="14" y2="25" strokeWidth="1"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/contact`,
      label: t("nav.contact"),
      icon: (
        <svg viewBox="0 0 28 28" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="24" height="18" rx="2"/>
          <path d="M2 7 L14 17 L26 7"/>
        </svg>
      ),
    },
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
                    if (window.innerWidth < 1280) setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-semibold tracking-widest ui-link transition hover:bg-gold/10"
                >
                  <span className="shrink-0">{item.icon}</span>
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
              {t("sidebar.language")}
            </label>
            <LanguageSwitcher />
          </div>

          {/* Season Selector */}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-gold/60 font-bold mb-2 block">
              {t("sidebar.season")}
            </label>
            {mounted && (
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SEASONAL_THEMES) as Season[]).map((s) => (
                  <ToggleChip key={s} isActive={season === s} onClick={() => setSeason(s)}>
                    {s}
                  </ToggleChip>
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
            {t("sidebar.github")}
          </a>
        </div>
      </aside>
    </>
  );
}
