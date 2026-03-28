import { Metadata } from "next";
import { NewsCard } from "@/components/NewsCard";
import { NewsItem } from "@/lib/types";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "WorldPulse | Global Intelligence Feed",
  description: "Real-time updates from the world of tech, geopolitics, and AI.",
};

const mockFeed: NewsItem[] = [
  {
    id: "1",
    title: "OpenAI Announces Strawberry-1 Model",
    summary: "The new model focuses on reasoning and has shown significant improvements in complex problem-solving tasks, particularly in coding and math. It marks a shift towards agentic behavior in LLMs.",
    source: "OpenAI / xAI",
    timestamp: "2h ago"
  },
  {
    id: "2",
    title: "NVIDIA's Blackwell Chips Enter Mass Production",
    summary: "Supply chain reports indicate that NVIDIA has secured massive orders for its next-gen AI chips. Production is scaling faster than expected to meet demand from cloud providers.",
    source: "Bloomberg",
    timestamp: "5h ago"
  },
  {
    id: "3",
    title: "Global Semiconductor Shortage and Geopolitics",
    summary: "New export controls and subsidies are reshaping the semiconductor landscape, with significant implications for AI development speeds in different regions.",
    source: "The Verge",
    timestamp: "8h ago"
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Standard Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span>WorldPulse</span>
          </div>
          <Button variant="outline" size="sm" className="text-xs uppercase tracking-widest font-bold">
            Subscribe
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto flex flex-col items-center flex-1 py-12 px-4 gap-12">
        <div className="flex flex-col items-center text-center gap-2 max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground leading-none">Intelligence Feed</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Global High-Signal Events</h1>
          <p className="text-muted-foreground text-sm max-w-sm mt-2">
            Automated intelligence gathered from across the tech and geopolitical landscape.
          </p>
        </div>

        <div className="grid w-full max-w-3xl gap-6">
          {mockFeed.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        <footer className="py-12 border-t w-full max-w-3xl flex flex-col items-center gap-2 text-center">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
            Aggregated every 6 hours
          </p>
          <div className="flex gap-4 text-[10px] text-muted-foreground font-medium">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
