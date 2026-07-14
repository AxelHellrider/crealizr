export const ROTATE_HINT_KEY = "hexmap-rotate-hint-dismissed";

/** Suggests rotating the device, shown on mobile portrait in fullscreen battlefield view only. */
export function RotateHintBanner({ onDismiss }: { onDismiss: () => void }) {
    return (
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-3 border border-gold/30 bg-card px-3 py-2 sm:hidden">
            <span className="text-lg leading-none text-gold" aria-hidden="true">⟳</span>
            <p className="flex-1 text-[11px] text-muted leading-snug">
                Rotate your device for a better view of the battlefield.
            </p>
            <button
                type="button"
                onClick={onDismiss}
                className="text-[10px] uppercase tracking-widest text-muted/70 hover:text-gold transition-colors shrink-0"
            >
                Got it
            </button>
        </div>
    );
}
