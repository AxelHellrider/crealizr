"use client";

export type MapMode = "select" | "place-hazard-env" | "place-hazard-spell" | "place-cover";

type ModeConfig = { mode: MapMode; label: string; shortcut?: string };

const MODES: ModeConfig[] = [
    { mode: "select",             label: "Move",         shortcut: "W" },
    { mode: "place-hazard-env",   label: "Env Hazard",   shortcut: "A" },
    { mode: "place-hazard-spell", label: "Spell Hazard", shortcut: "S" },
    { mode: "place-cover",        label: "Cover",        shortcut: "C" },
];

interface MapToolbarProps {
    mode: MapMode;
    cameraLocked: boolean;
    onModeChange: (mode: MapMode) => void;
    onCameraLockToggle: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    canClearAll: boolean;
    onClearAll: () => void;
    isFullscreen: boolean;
    onFullscreenToggle: () => void;
}

export function MapToolbar({
    mode, cameraLocked,
    onModeChange, onCameraLockToggle,
    onZoomIn, onZoomOut,
    canClearAll, onClearAll,
    isFullscreen, onFullscreenToggle,
}: MapToolbarProps) {

    if (isFullscreen) {
        const base = "flex flex-col items-center justify-center gap-0.5 px-4 min-h-[52px] text-[10px] uppercase tracking-widest transition-colors select-none shrink-0";
        const active = (on: boolean) => on ? "bg-gold/10 text-gold" : "text-muted hover:text-foreground active:text-gold";

        return (
            <div className="shrink-0 flex items-stretch divide-x divide-gold/10 border-t border-gold/10 bg-background overflow-x-auto">
                {MODES.map(({ mode: m, label }) => (
                    <button key={m} type="button" onClick={() => onModeChange(m)}
                        className={`${base} ${active(mode === m)}`} aria-pressed={mode === m}>
                        {label}
                    </button>
                ))}

                <button type="button" onClick={onCameraLockToggle}
                    className={`${base} ${active(cameraLocked)}`} aria-pressed={cameraLocked}>
                    {cameraLocked ? "Cam Locked" : "Lock Cam"}
                </button>

                <button type="button" onClick={onZoomIn}  className={`${base} ${active(false)}`} aria-label="Zoom in">+</button>
                <button type="button" onClick={onZoomOut} className={`${base} ${active(false)}`} aria-label="Zoom out">−</button>

                {canClearAll && (
                    <button type="button" onClick={onClearAll}
                        className={`${base} text-crimson/70 hover:text-crimson active:text-crimson`}>
                        Clear
                    </button>
                )}

                <button type="button" onClick={onFullscreenToggle}
                    className={`${base} text-foreground/70 hover:text-gold ml-auto border-l border-gold/10`}
                    aria-label="Exit fullscreen">
                    ← Exit
                </button>
            </div>
        );
    }

    // ── Normal compact toolbar ──────────────────────────────────────────────
    const btn = (on: boolean, danger?: boolean) =>
        `min-h-9 sm:min-h-0 flex items-center gap-1.5 text-[11px] sm:text-[10px] uppercase tracking-widest px-2.5 sm:px-2 py-2 sm:py-1 rounded-sm border transition-colors ${
            on      ? "border-gold bg-gold/15 text-gold"
          : danger  ? "border-crimson/25 text-crimson/70 hover:text-crimson hover:border-crimson/50"
          :           "border-gold/15 text-muted hover:text-gold hover:border-gold/40"
        }`;

    // Mobile (outside fullscreen): only the fullscreen toggle is shown — the
    // full button list only appears once fullscreen is entered. Desktop keeps
    // the full toolbar here, on top, at all times.
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <div className="hidden sm:flex flex-wrap items-center gap-1.5">
                {MODES.map(({ mode: m, label, shortcut }) => (
                    <button key={m} type="button" onClick={() => onModeChange(m)}
                        className={btn(mode === m)} aria-pressed={mode === m}>
                        {label}
                        {shortcut && (
                            <kbd className="font-mono text-[8px] opacity-50 border border-current rounded-xs px-[3px] leading-[11px]">
                                {shortcut}
                            </kbd>
                        )}
                    </button>
                ))}

                <span className="w-px self-stretch bg-gold/10" aria-hidden />

                <button type="button" onClick={onCameraLockToggle}
                    className={btn(cameraLocked)} aria-pressed={cameraLocked}>
                    {cameraLocked ? "Cam Locked" : "Lock Cam"}
                    <kbd className="font-mono text-[8px] opacity-50 border border-current rounded-xs px-[3px] leading-[11px]">L</kbd>
                </button>

                <button type="button" onClick={onZoomIn}  className={btn(false)} title="Zoom in  (+)">+</button>
                <button type="button" onClick={onZoomOut} className={btn(false)} title="Zoom out (−)">−</button>

                <span className="w-px self-stretch bg-gold/10" aria-hidden />

                <button type="button" onClick={onClearAll} disabled={!canClearAll}
                    className={`${btn(false, true)} disabled:opacity-30 disabled:pointer-events-none`}>
                    Clear hazards &amp; cover
                </button>

                {mode !== "select" && (
                    <span className="text-[9px] text-muted/60 italic">Click empty hex to place</span>
                )}
            </div>
        </div>
    );
}
