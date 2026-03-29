import { Inter, Geist_Mono, Oxanium } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
});

import { IntelligenceTicker } from "@/components/IntelligenceTicker";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WorldPulse | Tactical Global Intelligence Hub",
  description: "Experience mission-critical real-time intelligence on geopolitics, space, tech, and AI. High-signal reports for strategic analysts globally.",
  keywords: ["global intelligence", "real-time news", "geopolitical analysis", "AI news", "space intelligence", "tactical dashboard"],
  authors: [{ name: "Narvdeshwar Intelligence" }],
  openGraph: {
    title: "WorldPulse | Global Intelligence Hub",
    description: "Mission-critical real-time intelligence for strategic analysts.",
    url: "https://worldpulse.dev",
    siteName: "WorldPulse",
    images: [{ url: "/logo.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorldPulse | Global Intelligence Hub",
    description: "Mission-critical real-time intelligence on geopolitics, space, and AI.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico?v=1.1",
    shortcut: "/favicon.ico?v=1.1",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, geistMono.variable, oxanium.variable)}
    >
      <body className={cn("min-h-full flex flex-col bg-background text-foreground pb-10 font-sans", inter.className)}>
        {/* Global Intelligence Pixel (gtag) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-WORLD-PULSE`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WORLD-PULSE');
          `}
        </Script>
        {children}
        <Analytics />
        <IntelligenceTicker />
      </body>
    </html>
  );
}
