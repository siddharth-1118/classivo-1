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
import { ViewTransitions } from "next-view-transitions";
import PageTransition from "./components/PageTransition";
import NavigationWrapper from "./components/NavigationWrapper";
import QueryProvider from "./app/components/provider";
import { AIChat } from "./components/AIChat";
import NotificationPrompt from "./components/NotificationPrompt";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://classivo-1.vercel.app"),
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
    url: "https://classivo-1.vercel.app",
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
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon-512.png",
    apple: "/favicon-512.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon-512.png" type="image/png" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="manifest" href="/site.webmanifest?v=9" />
          <meta name="theme-color" content="#09090b" />
        </head>
        <body
          className={`${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
          style={{
            fontFamily: 'var(--font-body), system-ui, sans-serif'
          }}
        >
          <SwRegister />
          <AuthStateWatcher />
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
    </ViewTransitions>
  );
}
