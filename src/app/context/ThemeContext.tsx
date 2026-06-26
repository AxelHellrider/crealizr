"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSeason, getThemeForSeason, type Season } from "@/app/lib/seasonalThemes";

interface ThemeContextType {
    season: Season;
    setSeason: (season: Season) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [season, setSeason] = useState<Season>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("theme-season") as Season | null;
            if (saved && ['spring', 'summer', 'autumn', 'winter'].includes(saved)) return saved;
            return getSeason();
        }
        return getSeason();
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = window.setTimeout(() => setMounted(true), 0);
        return () => window.clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        document.documentElement.setAttribute("data-season", season);

        const c = getThemeForSeason(season);
        const root = document.documentElement;

        root.style.setProperty('--surface-base',   c.surfaceBase);
        root.style.setProperty('--surface-raised',  c.surfaceRaised);
        root.style.setProperty('--surface-card',    c.surfaceCard);
        root.style.setProperty('--surface-glass',   c.surfaceGlass);
        root.style.setProperty('--text-base',        c.textBase);
        root.style.setProperty('--text-secondary',   c.textSecondary);
        root.style.setProperty('--accent-primary',   c.accentPrimary);
        root.style.setProperty('--accent-secondary', c.accentSecondary);
        root.style.setProperty('--accent-tertiary',  c.accentTertiary);
        root.style.setProperty('--accent-special',   c.accentSpecial);
        root.style.setProperty('--border-accent',    c.borderAccent);
        root.style.setProperty('--border-subtle',    c.borderSubtle);
        root.style.setProperty('--border-glass',     c.borderGlass);
    }, [season, mounted]);

    const setSeasonHandler = (newSeason: Season) => {
        setSeason(newSeason);
        localStorage.setItem("theme-season", newSeason);
    };

    return (
        <ThemeContext.Provider value={{ season, setSeason: setSeasonHandler }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
}
