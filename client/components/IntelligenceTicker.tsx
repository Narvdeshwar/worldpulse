"use client";

import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

export function IntelligenceTicker() {
  const [ticks, setTicks] = useState<string[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTicker() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://worldpulse-api.onrender.com";
        const res = await fetch(`${apiUrl}/api/ticker`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTicks(data);
      } catch (e) {
        setError(true);
        // Fallback ticks
        setTicks([
          "📡 LATEST: DeepMind's AlphaFold 3 release expands biological understanding",
          "⚡ ENERGY: Solid-state battery production starts in pilot phase",
          "📈 GLOBAL: NASDAQ remains bullish on AI-integrated tech sector",
          "🔬 SCIENCE: CRISPR-based therapies approved for rare genetic conditions"
        ]);
      }
    }
    fetchTicker();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] h-12 border-t bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 overflow-hidden select-none">
      <div className="container mx-auto h-full flex items-center relative">
        <div className="flex-1 w-full overflow-hidden relative">
          <div className="flex animate-marquee whitespace-nowrap gap-16 items-center h-full">
            {/* Double the list for seamless loop */}
            {[...ticks, ...ticks].map((content, idx) => (
              <span
                key={idx}
                className="text-[13px] font-bold tracking-tight text-muted-foreground flex items-center gap-3 group hover:text-primary transition-all duration-300 cursor-default"
              >
                <span className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary transition-all duration-500 ring-4 ring-primary/10 shadow-[0_0_10px_rgba(20,255,180,0.2)] group-hover:shadow-[0_0_15px_rgba(20,255,180,0.6)]" />
                {content}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute right-0 z-10 bg-gradient-to-l from-background to-transparent w-24 h-full pointer-events-none" />
      </div>
    </div>
  );
}
