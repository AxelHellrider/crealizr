import type {Metadata} from "next";
import { buildHreflang } from "@/app/lib/seo";
import {Geist, Geist_Mono, Cinzel} from "next/font/google";
import {GoogleAnalytics} from "@next/third-parties/google";
import Script from "next/script";
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
import {CustomMonstersProvider} from "@/app/context/CustomMonstersContext";
import {NumpadProvider} from "@/app/context/NumpadContext";
import {Numpad} from "@/app/components/organisms/Numpad";
import {SeoJsonLd} from "@/app/components/atoms/SeoJsonLd";
import {runStartupEnvCheck} from "@/app/lib/startupEnvCheck";
import {Locale} from "@/i18n/config";
import MainContent from "@/app/components/organisms/MainContent";
import SidebarToggle from "@/app/components/atoms/SidebarToggle";

const cinzel = Cinzel({
    variable: "--font-cinzel",
    subsets: ["latin"],
});

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const siteUrl = "https://crealizr.net";

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
            '--text-secondary':  '#64748b',
            '--accent-primary':  '#c5a059',
            '--accent-secondary':'#a8b2c1',
            '--accent-tertiary': '#dc2626',
            '--accent-special':  '#3b82f6',
            '--accent-teal':     '#14b8a6',
            '--accent-purple':   '#8b5cf6',
            '--border-accent':   'rgba(197, 160, 89, 0.4)',
            '--border-subtle':   'rgba(168, 178, 193, 0.15)',
            '--border-glass':    'rgba(197, 160, 89, 0.15)',
        } as React.CSSProperties}>
        <head>
            <Script id="gtm" strategy="afterInteractive">
                {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-MXCP2F57');`}
            </Script>
        </head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased overscroll-contain`}>
        <noscript>
            <iframe
                src="https://www.googletagmanager.com/ns.html?id=GTM-MXCP2F57"
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
            />
        </noscript>
        <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
                <SeoJsonLd/>
                {/* Top route change progress bar */}
                <Suspense>
                    <RouteProgress/>
                </Suspense>
                <SidebarProvider>
                    <CustomMonstersProvider>
                        <NumpadProvider>
                            <Sidebar/>
                            <Header/>
                            <div className="hidden xl:block"><SidebarToggle/></div>
                            <MainContent>
                                {children}
                                <Footer/>
                            </MainContent>
                            <Numpad/>
                        </NumpadProvider>
                    </CustomMonstersProvider>
                </SidebarProvider>
            </ThemeProvider>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!}/>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
