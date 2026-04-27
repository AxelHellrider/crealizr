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
            const savedSeason = localStorage.getItem("theme-season") as Season | null;
            if (savedSeason && ['spring', 'summer', 'autumn', 'winter'].includes(savedSeason)) {
                return savedSeason;
            }
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
        if (mounted) {
            document.documentElement.setAttribute("data-season", season);
            
            // Apply CSS variables for the current seasonal theme
            const colors = getThemeForSeason(season);
            const root = document.documentElement;
            
            root.style.setProperty('--bg', colors.bg);
            root.style.setProperty('--bg-elev', colors.bgElev);
            root.style.setProperty('--card', colors.card);
            root.style.setProperty('--muted', colors.muted);
            root.style.setProperty('--text', colors.text);
            root.style.setProperty('--accent-gold', colors.accentPrimary);
            root.style.setProperty('--accent-silver', colors.accentSecondary);
            root.style.setProperty('--accent-crimson', colors.accentTertiary);
            root.style.setProperty('--accent-blue-ishgard', colors.accentQuaternary);
            root.style.setProperty('--border-gold', `1px solid ${colors.borderPrimary}`);
            root.style.setProperty('--border-silver', `1px solid ${colors.borderSecondary}`);
            root.style.setProperty('--glass-border', colors.glassBorder);
            root.style.setProperty('--glass-bg', colors.glassBg);
        }
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
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
