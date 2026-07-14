import type {Metadata, Viewport} from "next";
import { buildHreflang } from "@/app/lib/seo";
import {Geist, Geist_Mono, Cinzel, Yeseva_One, Gentium_Plus} from "next/font/google";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import "../globals.css";
import Sidebar from "@/app/components/organisms/Sidebar";
import Header from "@/app/components/organisms/Header";
import Footer from "@/app/components/organisms/Footer";
import RouteProgress from "@/app/components/RouteProgress";
import {Suspense} from "react";
import {ThemeProvider} from "@/app/context/ThemeContext";
import {SidebarProvider} from "@/app/context/SidebarContext";
import {MapFullscreenProvider} from "@/app/context/MapFullscreenContext";
import {CustomMonstersProvider} from "@/app/context/CustomMonstersContext";
import {NumpadProvider} from "@/app/context/NumpadContext";
import {Numpad} from "@/app/components/organisms/Numpad";
import {PickerProvider} from "@/app/context/PickerContext";
import {Picker} from "@/app/components/organisms/Picker";
import {CookieConsentProvider} from "@/app/context/CookieConsentContext";
import CookieBanner from "@/app/components/organisms/CookieBanner";
import PwaInstallPrompt from "@/app/components/organisms/PwaInstallPrompt";
import ConsentedGTM from "@/app/components/ConsentedGTM";
import ConsentDefault from "@/app/components/ConsentDefault";
import { SerwistProvider } from "@serwist/turbopack/react";
import {SeoJsonLd} from "@/app/components/atoms/SeoJsonLd";
import {runStartupEnvCheck} from "@/app/lib/startupEnvCheck";
import {Locale} from "@/i18n/config";
import MainContent from "@/app/components/organisms/MainContent";
import SidebarToggle from "@/app/components/atoms/SidebarToggle";

const cinzel = Cinzel({
    variable: "--font-cinzel",
    subsets: ["latin"],
});

// Cinzel is Latin-only. Greek and Cyrillic get their own display serif —
// see the `--font-serif` overrides in globals.css and SERIF_OVERRIDE_LOCALES
// below.
const yesevaOne = Yeseva_One({
    weight: "400",
    variable: "--font-yeseva-one",
    subsets: ["latin", "cyrillic"],
});

const gentiumPlus = Gentium_Plus({
    weight: ["400", "700"],
    style: ["normal", "italic"],
    variable: "--font-gentium-plus",
    subsets: ["latin", "greek"],
});

/** Locale -> the CSS class that overrides `--font-serif` for it (see globals.css). Latin-script locales use Cinzel, no class needed. */
const SERIF_OVERRIDE_LOCALES: Record<string, string> = {
    ru: "font-serif-ru",
    el: "font-serif-el",
};

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const siteUrl = "https://crealizr.net";

// viewport-fit=cover is required for env(safe-area-inset-*) to resolve to
// non-zero values on notch/home-indicator devices — see the safe-area
// padding in globals.css (.page-wrap, Header, Sidebar) that depends on it.
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    return {
        metadataBase: new URL(siteUrl),
        title: "CRealizr | Dungeons & Dragons Toolkit",
        description: "DM-first D&D 5e toolkit for dungeon masters — build encounters, scale monsters, and forge magic items. Supports 2014 and 2024 rulesets.",
        applicationName: "CRealizr",
        category: "Game",
        manifest: "/manifest.json",
        icons: {
            icon: "/crealizr_favicon.svg",
            shortcut: "/crealizr_favicon.svg",
            apple: "/crealizr_favicon.svg",
        },
        appleWebApp: {
            capable: true,
            statusBarStyle: "black-translucent",
            title: "CRealizr",
        },
        alternates: {
            canonical: `/${locale}`,
            languages: buildHreflang("/"),
        },
        openGraph: {
            type: "website",
            url: `/${locale}`,
            title: "CRealizr | Dungeons & Dragons Toolkit",
            description: "DM-first D&D 5e toolkit for dungeon masters — build encounters, scale monsters, and forge magic items. Supports 2014 and 2024 rulesets.",
            images: [{ url: "/og-default.svg", width: 1200, height: 630, alt: "CRealizr Toolkit" }],
        },
        twitter: {
            card: "summary_large_image",
            title: "CRealizr | Dungeons & Dragons Toolkit",
            description: "DM-first D&D 5e toolkit for dungeon masters — build encounters, scale monsters, and forge magic items. Supports 2014 and 2024 rulesets.",
            images: ["/og-default.svg"],
        },
        other: {
            "mobile-web-app-capable": "yes",
        },
    };
}

export default async function LocaleLayout({
                                               children,
                                               params
                                           }: Readonly<{
    children: React.ReactNode;
    params: Promise<{locale: string}>;
}>) {
    const {locale} = await params;
    const messages = await getMessages();
    runStartupEnvCheck();

    return (
        <html lang={locale as Locale} suppressHydrationWarning style={{
            '--surface-base':   '#0f0f13',
            '--surface-raised': '#1a1a23',
            '--surface-card':   '#15151e',
            '--surface-glass':  'rgba(26, 26, 35, 0.8)',
            '--text-base':       '#e2e8f0',
            '--text-secondary':  '#94a3b8',
            '--accent-primary':  '#c5a059',
            '--accent-secondary':'#a8b2c1',
            '--accent-tertiary': '#dc2626',
            '--accent-special':  '#3b82f6',
            '--border-accent':   'rgba(197, 160, 89, 0.4)',
            '--border-subtle':   'rgba(168, 178, 193, 0.15)',
            '--border-glass':    'rgba(197, 160, 89, 0.15)',
        } as React.CSSProperties}>
        <body
            className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${yesevaOne.variable} ${gentiumPlus.variable} antialiased overscroll-contain ${SERIF_OVERRIDE_LOCALES[locale] ?? ""}`}>
        <ConsentDefault/>
        <ConsentedGTM/>
        <SerwistProvider swUrl="/sw.js/sw.js" register={process.env.NODE_ENV === "production"} reloadOnOnline={false}>
        <NextIntlClientProvider messages={messages}>
            <CookieConsentProvider>
              <MapFullscreenProvider>
                <ThemeProvider>
                    <SeoJsonLd/>
                    <SidebarProvider>
                        {/* Route loading screen — closes the sidebar on completion, so must be inside SidebarProvider */}
                        <Suspense>
                            <RouteProgress/>
                        </Suspense>
                        <CustomMonstersProvider>
                            <NumpadProvider>
                                <PickerProvider>
                                    <Sidebar/>
                                    <Header/>
                                    <div className="hidden xl:block"><SidebarToggle/></div>
                                    <MainContent>
                                        {children}
                                        <Footer/>
                                    </MainContent>
                                    <Numpad/>
                                    <Picker/>
                                </PickerProvider>
                            </NumpadProvider>
                        </CustomMonstersProvider>
                    </SidebarProvider>
                </ThemeProvider>
                <CookieBanner/>
                <PwaInstallPrompt/>
              </MapFullscreenProvider>
            </CookieConsentProvider>
        </NextIntlClientProvider>
        </SerwistProvider>
        </body>
        </html>
    );
}
