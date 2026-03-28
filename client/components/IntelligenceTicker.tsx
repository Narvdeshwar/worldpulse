"use client";

import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

export function IntelligenceTicker() {
  const [ticks, setTicks] = useState<string[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTicker() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
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
    <div className="fixed bottom-0 left-0 right-0 z-[100] h-10 border-t bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 overflow-hidden select-none">
      <div className="container mx-auto h-full flex items-center relative">
        <div className="absolute left-0 z-10 bg-gradient-to-r from-background to-transparent w-24 h-full flex items-center pl-4 font-bold text-xs tracking-widest text-primary uppercase shrink-0">
          News Pulse
        </div>
        
        <div className="flex-1 w-full overflow-hidden relative">
          <div className="flex animate-marquee whitespace-nowrap gap-12 items-center">
            {/* Double the list for seamless loop */}
            {[...ticks, ...ticks].map((content, idx) => (
              <span 
                key={idx} 
                className="text-[11px] font-medium tracking-wide text-muted-foreground flex items-center gap-2 group hover:text-foreground transition-colors cursor-default"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors ring-4 ring-primary/5" />
                {content}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute right-0 z-10 bg-gradient-to-l from-background to-transparent w-16 h-full pointer-events-none" />
      </div>
    </div>
  );
}
