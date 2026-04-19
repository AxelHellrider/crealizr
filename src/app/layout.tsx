import type {Metadata} from "next";
import {Geist, Geist_Mono, Cinzel} from "next/font/google";
import {GoogleAnalytics} from "@next/third-parties/google";
import "./globals.css";
import Header from "@/app/components/organisms/Header";
import Footer from "@/app/components/organisms/Footer";
import RouteProgress from "@/app/components/RouteProgress";
import {Suspense} from "react";
import {ThemeProvider} from "@/app/context/ThemeContext";
import {MobileBackToToolkit} from "@/app/components/atoms/MobileBackToToolkit";
import {SeoJsonLd} from "@/app/components/atoms/SeoJsonLd";

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

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased overscroll-contain`}>
        <div className="cf-turnstile" data-sitekey="0x4AAAAAAC_zOoHrqEjDG26R"></div>
        <ThemeProvider>
            <SeoJsonLd/>
            {/* Top route change progress bar */}
            <Suspense>
                <RouteProgress/>
            </Suspense>
            {/* Isolated scroll container prevents viewport rubber-band bounce */}
            <div className="scroll-container">
                <Header/>
                <main className="page-wrap">
                    {children}
                </main>
                <Footer/>
            </div>
            <MobileBackToToolkit/>
        </ThemeProvider>
        <script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
        ></script>
        </body>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!}/>
        </html>
    );
}
