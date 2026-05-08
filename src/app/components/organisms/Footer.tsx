"use client";

import Link from "next/link";
import {useLocale} from 'next-intl';

export default function Footer() {
    const locale = useLocale();

    return (
        <footer className="w-full mt-24 border-t border-gold/20 bg-card/30 backdrop-blur-sm">
            <div className="max-w-[calc(100svw - 2rem)] mx-auto px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    {/* Brand */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-serif accent-gold uppercase tracking-[0.2em]">CRealizr</h2>
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
                        <a href="https://github.com/AxelHellrider" target="_blank" rel="noreferrer" className="ui-link transition uppercase hover:text-gold">GitHub</a>
                    </nav>
                </div>

                <div className="mt-8 pt-8 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted">
                        Version 0.9 · Validated for 2014 & 2024 SRD
                    </p>
                    <p className="text-xs text-muted">
                        © {new Date().getFullYear()} Alexandros Nomikos — All Rights Reserved
                    </p>
                </div>
            </div>
        </footer>
    );
}
