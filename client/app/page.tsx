import { NewsItem } from "@/lib/types";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { Button } from "@/components/ui/button";
import { LiveClock } from "@/components/LiveClock";
import { FilteredIntelligence } from "@/components/FilteredIntelligence";
import { Suspense } from "react";

async function getIntelligenceFeed(): Promise<NewsItem[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
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
          <div className="flex flex-col">
            <h2 className="font-black text-xl tracking-tighter text-primary leading-none">WorldPulse</h2>
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-1">Intelligence Core</div>
          </div>

          <div className="hidden md:flex flex-col items-center flex-1">
            <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/90">World Intelligence Feed</h1>
          </div>

          <div className="flex items-center gap-6">
            <SubscribeDialog />
            <div className="hidden sm:block border-l border-border/40 h-8 mr-[-8px]" />
            <LiveClock />
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-col flex-1 py-3 px-3 gap-6">
        <Suspense fallback={
          <div className="flex flex-col gap-6 py-12 items-center">
            <div className="h-4 w-48 bg-muted animate-pulse rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)}
            </div>
          </div>
        }>
          <FilteredIntelligence initialFeed={initialFeed} />
        </Suspense>
      </main>
    </div>
  );
}
