import React from "react";
import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SwRegister from "./components/sw-register";
import { AuthStateWatcher } from "./components/AuthStateWatcher";
import { ToasterClientComponent } from "./toaster";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import PagePadding from "./components/PagePadding";
import PageTransition from "./components/PageTransition";
import NavigationWrapper from "./components/NavigationWrapper";
import QueryProvider from "./app/components/provider";
import { AIChat } from "./components/AIChat";
import NotificationPrompt from "./components/NotificationPrompt";
import { AuthAnalytics } from "./components/AuthAnalytics";
import { PageViewAnalytics } from "./components/PageViewAnalytics";
import MessNotificationScheduler from "./components/MessNotificationScheduler";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const description = "Classivo helps SRM students track attendance, marks, timetable, day order, and academic calendar in one clear student-friendly app.";
const enableVercelAnalytics = process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_URL ??
  "https://classivo-1.vercel.app";
const iconVersion = "11";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CLASSIVO SRM",
    template: "%s | CLASSIVO SRM",
  },
  description,
  verification: {
    google: ["D5DQAd4OvMAzaT1kOX4HAmkqhAfz_hq6XW-zbw0Jo0k", "googlee4776157d45cbccf"],
  },
  authors: [{ name: "vss" }],
  keywords: [
    "CLASSIVO SRM",
    "Classivo",
    "Classivo SRM app",
    "SRM timetable",
    "SRM attendance",
    "SRM marks",
    "SRM academic calendar",
    "SRM student portal",
    "Academic management",
  ],
  openGraph: {
    title: "CLASSIVO SRM",
    description,
    url: siteUrl,
    siteName: "CLASSIVO SRM",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/classivo-og.png",
        width: 1200,
        height: 630,
        alt: "CLASSIVO SRM - Academic Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CLASSIVO SRM",
    description,
    images: ["/classivo-og.png"],
  },
  icons: {
    icon: [
      { url: `/favicon.ico?v=${iconVersion}` },
      { url: `/favicon-16.png?v=${iconVersion}`, type: "image/png", sizes: "16x16" },
      { url: `/favicon-32.png?v=${iconVersion}`, type: "image/png", sizes: "32x32" },
      { url: `/favicon-512.png?v=${iconVersion}`, type: "image/png", sizes: "512x512" },
      { url: `/favicon.svg?v=${iconVersion}`, type: "image/svg+xml" },
    ],
    shortcut: [`/favicon.ico?v=${iconVersion}`],
    apple: [{ url: `/apple-touch-icon.png?v=${iconVersion}`, sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href={`/favicon.ico?v=${iconVersion}`} sizes="any" />
        <link rel="icon" href={`/favicon-32.png?v=${iconVersion}`} type="image/png" sizes="32x32" />
        <link rel="icon" href={`/favicon-16.png?v=${iconVersion}`} type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href={`/apple-touch-icon.png?v=${iconVersion}`} />
        <link rel="icon" href={`/favicon.svg?v=${iconVersion}`} type="image/svg+xml" />
        <link rel="manifest" href={`/site.webmanifest?v=${iconVersion}`} />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body
        className={`classivo-light ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
        style={{
          fontFamily: 'var(--font-body), system-ui, sans-serif'
        }}
      >
        <SwRegister />
        <AuthStateWatcher />
        <PageViewAnalytics />
        <AuthAnalytics />
        <MessNotificationScheduler />
        <ToasterClientComponent />
        
        <QueryProvider>
          <NavigationWrapper>
            <main className="min-h-screen relative z-10 overflow-x-hidden">
              <PagePadding>
                <PageTransition>
                  {children}
                </PageTransition>
              </PagePadding>
            </main>
          </NavigationWrapper>
        </QueryProvider>
        <AIChat />
        <NotificationPrompt />
        {enableVercelAnalytics ? <Analytics /> : null}
        {enableVercelAnalytics ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
