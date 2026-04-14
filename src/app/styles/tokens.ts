/**
 * Design Tokens for CRealizr
 * FFXIV Heavensward & Stormblood Inspired
 */
export const TOKENS = {
    colors: {
        // Light Mode (Heavensward Ishgardian)
        light: {
            bg: "#f5f6f8",
            bgElev: "#ffffff",
            card: "#ffffff",
            muted: "#5e6471",
            text: "#1a1c22",
            accentGold: "#c5a059",
            accentSilver: "#94a3b8",
            accentCrimson: "#a62a2a",
            accentBlueIshgard: "#475a7a",
            glassBorder: "rgba(197, 160, 89, 0.15)",
            glassBg: "rgba(255, 255, 255, 0.9)",
        },
        // Dark Mode (Deep Obsidian)
        dark: {
            bg: "#0d0f14",
            bgElev: "#161922",
            card: "#12151c",
            muted: "#a0aec0",
            text: "#f0f2f5",
            accentGold: "#d4af37",
            accentSilver: "#b2becd",
            accentCrimson: "#e53e3e",
            accentBlueIshgard: "#5a73a3",
            glassBorder: "rgba(212, 175, 55, 0.2)",
            glassBg: "rgba(18, 21, 28, 0.9)",
        },
    },
    typography: {
        fonts: {
            serif: "var(--font-cinzel)",
            sans: "var(--font-geist-sans)",
            mono: "var(--font-geist-mono)",
        },
        letterSpacing: {
            widest: "0.2em",
            wide: "0.05em",
            tight: "-0.02em",
        },
    },
    spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
    },
    borders: {
        radius: {
            sm: "2px",
            md: "4px",
            full: "9999px",
        },
    },
    shadows: {
        fantasy: "var(--shadow-fantasy)",
        glow: "var(--shadow-glow)",
    },
    transitions: {
        default: "all 0.2s ease",
    },
} as const;
