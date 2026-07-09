"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCookieConsent } from "@/app/context/CookieConsentContext";

const DISMISS_KEY = "pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
    const t = useTranslations("pwaInstall");
    const { bannerVisible: cookieBannerVisible } = useCookieConsent();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };
        const handleInstalled = () => {
            setDeferredPrompt(null);
            window.localStorage.setItem(DISMISS_KEY, "1");
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);
        window.addEventListener("appinstalled", handleInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
    };

    const dismiss = () => {
        window.localStorage.setItem(DISMISS_KEY, "1");
        setDismissed(true);
    };

    // Never fires on browsers without install support (e.g. iOS Safari), and
    // deferred until the cookie banner is resolved so the two never stack.
    if (!deferredPrompt || dismissed || cookieBannerVisible) return null;

    return (
        <div
            role="dialog"
            aria-live="polite"
            aria-label={t("title")}
            className="fixed inset-x-0 bottom-0 z-[190] border-t border-gold/20 bg-surface/95 backdrop-blur-sm"
        >
            <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                    <p className="font-serif uppercase tracking-widest text-xs text-gold mb-1">{t("title")}</p>
                    <p className="text-sm text-muted">{t("description")}</p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={dismiss}
                        className="ui-button text-xs uppercase tracking-widest px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                    >
                        {t("dismiss")}
                    </button>
                    <button
                        type="button"
                        onClick={install}
                        className="ui-button ui-button-primary text-xs uppercase tracking-widest px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                    >
                        {t("install")}
                    </button>
                </div>
            </div>
        </div>
    );
}
