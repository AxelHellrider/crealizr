"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useCookieConsent } from "@/app/context/CookieConsentContext";
import CrealizrMark from "@/app/components/atoms/CrealizrMark";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
    const t = useTranslations("pwaInstall");
    const { bannerVisible: cookieBannerVisible } = useCookieConsent();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };
        const handleInstalled = () => {
            setInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);
        window.addEventListener("appinstalled", handleInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, []);

    useEffect(() => {
        if (!expanded) return;
        const handlePointerDown = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setExpanded(false);
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setExpanded(false);
        };
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [expanded]);

    const install = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setExpanded(false);
        // "accepted" here just means the OS install dialog was confirmed —
        // the actual `appinstalled` event (handled above) is what reliably
        // hides the badge, but this avoids a flash of the badge in between.
        if (outcome === "accepted") setInstalled(true);
    };

    // Deny only closes the expanded prompt — the badge itself stays, so the
    // visitor can reopen it anytime rather than losing the offer for good.
    const deny = () => setExpanded(false);

    // Never fires on browsers without install support (e.g. iOS Safari).
    if (installed || !deferredPrompt) return null;

    const promptCard = (
        <>
            <p className="font-serif uppercase tracking-widest text-xs text-gold mb-1">{t("title")}</p>
            <p className="text-sm text-muted mb-4">{t("description")}</p>
            <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={deny}
                    className="ui-button text-xs uppercase tracking-widest px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                >
                    {t("dismiss")}
                </button>
                <button
                    type="button"
                    onClick={install}
                    className="ui-button ui-button-primary text-xs uppercase tracking-widest px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                >
                    {t("install")}
                </button>
            </div>
        </>
    );

    return (
        <div
            ref={containerRef}
            className={`fixed right-4 z-[150] transition-[bottom] duration-300 ${cookieBannerVisible ? "bottom-28 sm:bottom-24" : "bottom-4"}`}
        >
            {/* Mobile: centered modal popup */}
            {expanded && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={t("title")}
                    className="sm:hidden fixed inset-0 z-[151] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setExpanded(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm rounded-md border border-gold/20 bg-surface p-5 shadow-xl mb-4"
                    >
                        {promptCard}
                    </div>
                </div>
            )}

            {/* Desktop: popover anchored above the badge, not full-width */}
            {expanded && (
                <div
                    role="dialog"
                    aria-label={t("title")}
                    className="hidden sm:block absolute bottom-full right-0 mb-3 w-72 rounded-md border border-gold/20 bg-surface/95 backdrop-blur-sm p-4 shadow-xl"
                >
                    {promptCard}
                </div>
            )}

            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-label={t("title")}
                aria-expanded={expanded}
                className="flex items-center justify-center h-12 w-12 rounded-full border border-gold/40 bg-card shadow-[0_2px_12px_rgba(0,0,0,0.5)] text-gold hover:border-gold hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            >
                <CrealizrMark className="h-6 w-auto" />
            </button>
        </div>
    );
}
