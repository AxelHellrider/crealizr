"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSeason, getThemeForSeason, type Season } from "@/app/lib/seasonalThemes";

interface ThemeContextType {
    season: Season;
    setSeason: (season: Season) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function readSavedSeason(): Season {
    try {
        const saved = localStorage.getItem("theme-season") as Season | null;
        if (saved && ["spring", "summer", "autumn", "winter"].includes(saved)) return saved;
    } catch {
        // localStorage unavailable in SSR / private-mode browsers
    }
    return getSeason();
}

function applyTheme(season: Season) {
    const root = document.documentElement;
    const c = getThemeForSeason(season);
    root.setAttribute("data-season", season);
    root.style.setProperty("--surface-base",     c.surfaceBase);
    root.style.setProperty("--surface-raised",   c.surfaceRaised);
    root.style.setProperty("--surface-card",     c.surfaceCard);
    root.style.setProperty("--surface-glass",    c.surfaceGlass);
    root.style.setProperty("--text-base",        c.textBase);
    root.style.setProperty("--text-secondary",   c.textSecondary);
    root.style.setProperty("--accent-primary",   c.accentPrimary);
    root.style.setProperty("--accent-secondary", c.accentSecondary);
    root.style.setProperty("--accent-tertiary",  c.accentTertiary);
    root.style.setProperty("--accent-special",   c.accentSpecial);
    root.style.setProperty("--border-accent",    c.borderAccent);
    root.style.setProperty("--border-subtle",    c.borderSubtle);
    root.style.setProperty("--border-glass",     c.borderGlass);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [season, setSeason] = useState<Season>(getSeason);

    // On mount: read persisted season (localStorage not available during SSR),
    // reconcile with server-rendered value, and apply CSS vars.
    useEffect(() => {
        const saved = readSavedSeason();
        setSeason(saved);
        applyTheme(saved);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-apply theme whenever season changes after mount.
    useEffect(() => {
        applyTheme(season);
    }, [season]);

    const setSeasonHandler = (newSeason: Season) => {
        setSeason(newSeason);
        try { localStorage.setItem("theme-season", newSeason); } catch { /* ignore */ }
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
