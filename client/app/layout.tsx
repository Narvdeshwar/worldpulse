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

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WorldPulse | Real-Time Global Intelligence",
  description: "Curated, high-signal intelligence feed for global events, tech, and geopolitics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "dark", inter.variable, geistMono.variable, oxanium.variable)}
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
        <IntelligenceTicker />
      </body>
    </html>
  );
}
