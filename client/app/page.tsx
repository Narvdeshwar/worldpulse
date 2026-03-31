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

    if (!res.ok) throw new Error("News hub unavailable");
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
        <div className="container mx-auto flex h-auto min-h-[4rem] items-center justify-between px-3 sm:px-6 gap-3">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-xl border-2 border-primary/20 shadow-[0_0_20px_var(--primary-glow)]">
              <Image 
                src="/logo.png" 
                alt="WorldPulse Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="font-semibold text-[15px] sm:text-[16px] tracking-tight text-primary leading-none">WorldPulse</h2>
              <div className="text-[11px] sm:text-[12px] uppercase tracking-wider font-normal text-muted-foreground/60 mt-0.5 sm:mt-1">AI News Hub</div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center flex-1 mx-4">
            <h1 className="text-[14px] font-semibold uppercase tracking-[0.2em] text-foreground/80">Mission Critical Intelligence</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <div className="hidden xs:block">
              <SubscribeDialog />
            </div>
            <div className="hidden sm:block border-l border-border/40 h-6 mx-1" />
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
