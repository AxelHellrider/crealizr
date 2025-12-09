import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import RouteProgress from "@/app/components/RouteProgress";
import {Suspense} from "react";

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
  description: "For a better TTRPG experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
      </body>
    </html>
  );
}
