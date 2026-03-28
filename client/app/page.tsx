import { NewsCard } from "@/components/NewsCard";
import { NewsItem } from "@/lib/types";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

async function getIntelligenceFeed(): Promise<NewsItem[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
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
  const feed = await getIntelligenceFeed();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
        <div className="container mx-auto flex flex-wrap h-auto min-h-[4rem] items-center justify-between px-4 gap-4">
          <div className="flex flex-col">
            <div className="font-black text-xl tracking-tighter text-primary leading-none">WorldPulse</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-1">Intelligence Core</div>
          </div>

          <div className="hidden md:flex flex-col items-center flex-1">
            <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/90">World Intelligence Feed</h1>
            
          </div>

          <div className="flex items-center gap-3">
            <SubscribeDialog />
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-col flex-1 py-8 px-4 gap-12">
        <Separator className="bg-border/30" />

        {feed.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center gap-4">
            <p className="text-muted-foreground">The intelligence pipeline is currently offline.</p>
            <Button variant="outline" size="sm">Reload Connections</Button>
          </div>
        ) : (
          <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {feed.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
