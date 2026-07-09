"use client";

import Link from "next/link";
import {useLocale, useTranslations} from 'next-intl';
import CrealizrLogo from "@/app/components/atoms/CrealizrLogo";
import { useCookieConsent } from "@/app/context/CookieConsentContext";
import { version } from "../../../../package.json";

export default function Footer() {
    const locale = useLocale();
    const t = useTranslations();
    const { openPreferences } = useCookieConsent();

    return (
        <footer className="w-full mt-24 border-t border-gold/20 bg-card/30 backdrop-blur-sm">
            <div className="max-w-[calc(100svw - 2rem)] mx-auto px-8 py-12">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    {/* Brand */}
                    <div className="space-y-2">
                        <CrealizrLogo className="block w-full h-12" />
                        <p className="text-sm text-muted">
                            {t("footer.tagline")}
                        </p>
                    </div>

                    {/* Links */}
                    <nav className="flex flex-wrap gap-6 text-sm font-semibold tracking-widest">
                        <Link href={`/${locale}/encounter-builder`} className="ui-link transition uppercase hover:text-gold">{t("nav.encounterBuilder")}</Link>
                        <Link href={`/${locale}/monster-scaler`} className="ui-link transition uppercase hover:text-gold">{t("nav.monsterScaler")}</Link>
                        <Link href={`/${locale}/travel-encounters`} className="ui-link transition uppercase hover:text-gold">{t("nav.travelEncounters")}</Link>
                        <Link href={`/${locale}/artifact-forge`} className="ui-link transition uppercase hover:text-gold">{t("nav.artifactForge")}</Link>
                        <Link href={`/${locale}/my-monsters`} className="ui-link transition uppercase hover:text-gold">{t("nav.myMonsters")}</Link>
                        <a href="https://github.com/AxelHellrider" target="_blank" rel="noreferrer" className="ui-link transition uppercase hover:text-gold">{t("sidebar.github")}</a>
                    </nav>
                </div>

                <div className="mt-8 pt-8 border-t border-gold/10 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted">
                        v{version} · {t("footer.versionNote")}
                    </p>
                    <nav className="flex flex-wrap gap-4 text-xs">
                        <Link href={`/${locale}/terms`} className="ui-link transition hover:text-gold">{t("terms.title")}</Link>
                        <Link href={`/${locale}/disclaimer`} className="ui-link transition hover:text-gold">{t("disclaimer.title")}</Link>
                        <Link href={`/${locale}/privacy`} className="ui-link transition hover:text-gold">{t("privacy.title")}</Link>
                        <button type="button" onClick={openPreferences} className="ui-link transition hover:text-gold">{t("cookieBanner.manage")}</button>
                    </nav>
                    <p className="text-xs text-muted">
                        {t("footer.copyright", { year: new Date().getFullYear() })}
                    </p>
                </div>
            </div>
        </footer>
    );
}
