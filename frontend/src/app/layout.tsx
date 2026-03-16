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

const description = "CLASSIVO SRM - The ultimate academic management tool for SRM students.";

export const metadata: Metadata = {
  title: {
    default: "CLASSIVO SRM",
    template: "%s | CLASSIVO SRM",
  },
  description,
  verification: {
    google: "lqZoy4RwbD94xx4x_rz8CjmuvarmsG32kB5obHt0kdc",
  },
  authors: [{ name: "StealthTensor" }],
  keywords: ["CLASSIVO SRM", "SRM Academia", "SRM University", "Classivo Student Portal", "Academic Management"],
  openGraph: {
    title: "CLASSIVO SRM",
    description,
    url: "https://classivo123.vercel.app",
    siteName: "CLASSIVO SRM",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://u.cubeupload.com/Trinai308/r8A6pD.png",
        width: 1200,
        height: 630,
        alt: "CLASSIVO SRM - Academic Management",
      },
    ],
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
          <link rel="icon" href="/classivo-icon.png" />
          <link
            rel="icon"
            type="image/png"
            href="/classivo-icon.png"
            sizes="96x96"
          />
          <link rel="icon" type="image/svg+xml" href="/classivo-icon.png" />
          <link
            rel="apple-touch-icon"
            href="/classivo-icon.png"
            sizes="180x180"
          />
          <link rel="manifest" href="/site.webmanifest?v=7" />
          <meta name="theme-color" content="#09090b" />
        </head>
        <body
          className={`${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
          style={{
            fontFamily: 'var(--font-ordina), var(--font-space-grotesk), system-ui, sans-serif'
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
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}
