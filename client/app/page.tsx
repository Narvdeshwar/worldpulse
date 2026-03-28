import { Metadata } from "next";
import { NewsCard } from "@/components/NewsCard";
import { NewsItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "WorldPulse",
  description: "Global Intelligence Feed.",
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
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="font-bold text-xl tracking-tight">WorldPulse</div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Archives</Button>
            <Button size="sm">Subscribe</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-col flex-1 py-8 px-4 gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">World Intel</h1>
          <p className="text-muted-foreground">The latest high-signal updates from the world pulse.</p>
        </div>
        
        <Separator />

        <div className="grid gap-6 max-w-4xl">
          {mockFeed.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm text-muted-foreground">
          <p>© 2024 WorldPulse</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Help</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
