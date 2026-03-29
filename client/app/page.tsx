import { NewsItem } from "@/lib/types";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { Button } from "@/components/ui/button";
import { LiveClock } from "@/components/LiveClock";
import { FilteredIntelligence } from "@/components/FilteredIntelligence";
import { ShimmerFeed } from "@/components/ShimmerUI";
import { Suspense } from "react";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

async function getIntelligenceFeed(): Promise<NewsItem[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://worldpulse-api.onrender.com";
    const res = await fetch(`${apiUrl}/api/feed`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Intelligence server unavailable");
    return res.json();
  } catch (error) {
    console.error("Feed fetch failed:", error);
    return [];
  }
}

export default async function Home() {
  const initialFeed = await getIntelligenceFeed();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
        <div className="container mx-auto flex flex-wrap h-auto min-h-[4rem] items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-primary/20 shadow-[0_0_20px_var(--primary-glow)]">
              <Image 
                src="/logo.png" 
                alt="WorldPulse Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="font-black text-2xl tracking-tighter text-primary leading-none">WorldPulse</h2>
              <div className="text-[12px] uppercase tracking-[0.25em] font-black text-muted-foreground/60 mt-1.5">AI Strategic Node</div>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center flex-1">
            <h1 className="text-base font-black uppercase tracking-[0.3em] text-foreground/90">AI Intelligence Grid</h1>
          </div>

          <div className="flex items-center gap-4">
            <SubscribeDialog />
            <div className="hidden sm:block border-l border-border/40 h-8" />
            <ThemeSwitcher />
            <LiveClock />
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-col flex-1 py-3 px-3 gap-6">
        <Suspense fallback={<ShimmerFeed />}>
          <FilteredIntelligence initialFeed={initialFeed} />
        </Suspense>
      </main>
    </div>
  );
}
