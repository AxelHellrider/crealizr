"use client";

import Link from "next/link";
import {useLocale, useTranslations} from 'next-intl';
import CrealizrLogo from "@/app/components/atoms/CrealizrLogo";
import { useCookieConsent } from "@/app/context/CookieConsentContext";
import { version } from "../../../../package.json";

export default function Footer() {
    const locale = useLocale();
    const t = useTranslations("cookieBanner");
    const { openPreferences } = useCookieConsent();

    return (
        <footer className="w-full mt-24 border-t border-gold/20 bg-card/30 backdrop-blur-sm">
            <div className="max-w-[calc(100svw - 2rem)] mx-auto px-8 py-12">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    {/* Brand */}
                    <div className="space-y-2">
                        <CrealizrLogo className="block w-full h-12" />
                        <p className="text-sm text-muted">
                            DM-first D&D toolkit
                        </p>
                    </div>

                    {/* Links */}
                    <nav className="flex flex-wrap gap-6 text-sm font-semibold tracking-widest">
                        <Link href={`/${locale}/encounter-builder`} className="ui-link transition uppercase hover:text-gold">Encounter Builder</Link>
                        <Link href={`/${locale}/monster-scaler`} className="ui-link transition uppercase hover:text-gold">Monster Scaler</Link>
                        <Link href={`/${locale}/travel-encounters`} className="ui-link transition uppercase hover:text-gold">Travel Encounters</Link>
                        <Link href={`/${locale}/artifact-forge`} className="ui-link transition uppercase hover:text-gold">Artifact Forge</Link>
                        <Link href={`/${locale}/my-monsters`} className="ui-link transition uppercase hover:text-gold">My Monsters</Link>
                        <a href="https://github.com/AxelHellrider" target="_blank" rel="noreferrer" className="ui-link transition uppercase hover:text-gold">GitHub</a>
                    </nav>
                </div>

                <div className="mt-8 pt-8 border-t border-gold/10 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted">
                        v{version} · Validated for 2014 & 2024 SRD – Not affiliated with Wizards of the Coast
                    </p>
                    <nav className="flex flex-wrap gap-4 text-xs">
                        <Link href={`/${locale}/terms`} className="ui-link transition hover:text-gold">Terms of Use</Link>
                        <Link href={`/${locale}/disclaimer`} className="ui-link transition hover:text-gold">Disclaimer</Link>
                        <Link href={`/${locale}/privacy`} className="ui-link transition hover:text-gold">Privacy Policy</Link>
                        <button type="button" onClick={openPreferences} className="ui-link transition hover:text-gold">{t("manage")}</button>
                    </nav>
                    <p className="text-xs text-muted">
                        © {new Date().getFullYear()} CRealizr — All Rights Reserved
                    </p>
                </div>
            </div>
        </footer>
    );
}
