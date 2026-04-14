import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/organisms/Header";
import Footer from "@/app/components/organisms/Footer";
import RouteProgress from "@/app/components/RouteProgress";
import {Suspense} from "react";
import { ThemeProvider } from "@/app/context/ThemeContext";

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

export const metadata: Metadata = {
  title: "CRealizr | Dungeons & Dragons Toolkit",
  description: "Advanced TTRPG encounter tools with high-fantasy precision",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased overscroll-contain`}>
        <ThemeProvider>
            {/* Top route change progress bar */}
            <Suspense>
                <RouteProgress />
            </Suspense>
            {/* Isolated scroll container prevents viewport rubber-band bounce */}
            <div className="scroll-container">
              <Header />
              <main className="page-wrap">
                {children}
              </main>
              <Footer />
            </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
