import { NewsCard } from "@/components/NewsCard";
import { NewsItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="font-bold text-xl tracking-tight">WorldPulse</div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Archives</Button>
            <Button size="sm">Subscribe</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-col flex-1 py-12 px-4 gap-8">
        <div className="flex flex-col gap-1 max-w-2xl px-2">
          <h1 className="text-3xl font-bold tracking-tight">World Intelligence Feed</h1>
          <p className="text-muted-foreground text-sm">
            High-signal global updates aggregated every 2 hours.
          </p>
        </div>
        
        <Separator className="bg-border/50" />

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
