"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useCookieConsent } from "@/app/context/CookieConsentContext";

export default function CookieBanner() {
    const t = useTranslations("cookieBanner");
    const locale = useLocale();
    const { bannerVisible, grant, deny } = useCookieConsent();

    if (!bannerVisible) return null;

    return (
        <div
            role="dialog"
            aria-live="polite"
            aria-label={t("title")}
            className="sticky bottom-0 z-[200] border-t border-gold/20 bg-surface/95 backdrop-blur-sm"
        >
            <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                    <p className="font-serif uppercase tracking-widest text-xs text-gold mb-1">{t("title")}</p>
                    <p className="text-sm text-muted">
                        {t.rich("description", {
                            link: (chunks) => (
                                <Link href={`/${locale}/privacy`} className="ui-link">
                                    {chunks}
                                </Link>
                            ),
                        })}
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={deny}
                        className="ui-button text-xs uppercase tracking-widest px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                    >
                        {t("decline")}
                    </button>
                    <button
                        type="button"
                        onClick={grant}
                        className="ui-button ui-button-primary text-xs uppercase tracking-widest px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                    >
                        {t("accept")}
                    </button>
                </div>
            </div>
        </div>
    );
}
