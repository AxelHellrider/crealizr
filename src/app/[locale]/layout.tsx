import type {Metadata} from "next";
import {Geist, Geist_Mono, Cinzel} from "next/font/google";
import {GoogleAnalytics} from "@next/third-parties/google";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import "../globals.css";
import Sidebar from "@/app/components/organisms/Sidebar";
import Footer from "@/app/components/organisms/Footer";
import RouteProgress from "@/app/components/RouteProgress";
import {Suspense} from "react";
import {ThemeProvider} from "@/app/context/ThemeContext";
import {SidebarProvider} from "@/app/context/SidebarContext";
import SidebarToggle from "@/app/components/atoms/SidebarToggle";
import {SeoJsonLd} from "@/app/components/atoms/SeoJsonLd";
import {runStartupEnvCheck} from "@/app/lib/startupEnvCheck";
import {Locale} from "@/i18n/config";
import MainContent from "@/app/components/organisms/MainContent";

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

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: "CRealizr | Dungeons & Dragons Toolkit",
    description: "DM-first D&D toolkit to build encounters, scale monsters, and forge artifacts with export-ready outputs.",
    applicationName: "CRealizr",
    category: "Game",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        url: "/",
        title: "CRealizr | Dungeons & Dragons Toolkit",
        description: "DM-first D&D toolkit to build encounters, scale monsters, and forge artifacts with export-ready outputs.",
        images: [{url: "/og-default.svg", width: 1200, height: 630, alt: "CRealizr Toolkit"}],
    },
    twitter: {
        card: "summary_large_image",
        title: "CRealizr | Dungeons & Dragons Toolkit",
        description: "DM-first D&D toolkit to build encounters, scale monsters, and forge artifacts with export-ready outputs.",
        images: ["/og-default.svg"],
    },
};

export default async function LocaleLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{locale: Locale}>;
}>) {
    const {locale} = await params;
    const messages = await getMessages();
    runStartupEnvCheck();

    return (
        <html lang={locale} suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased overscroll-contain`}>
        <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
                <SeoJsonLd/>
                {/* Top route change progress bar */}
                <Suspense>
                    <RouteProgress/>
                </Suspense>
                <SidebarProvider>
                    <SidebarToggle/>
                    <Sidebar/>
                    <MainContent>
                        {children}
                        <Footer/>
                    </MainContent>
                </SidebarProvider>
            </ThemeProvider>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!}/>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
