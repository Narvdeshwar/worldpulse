import { Metadata } from "next";
import { NewsCard } from "@/components/NewsCard";
import { NewsItem } from "@/lib/types";

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
    <div className="flex flex-col items-center flex-1 w-full relative">
      {/* Cinematic Header */}
      <header className="sticky top-0 z-50 w-full flex justify-center py-6 px-4 bg-black/10 backdrop-blur-sm border-b border-white/5 transition-all">
        <div className="flex w-full max-w-4xl justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="h-4 w-4 rounded-full bg-primary/80 transition-all group-hover:glow-primary" />
            <span className="text-sm font-bold tracking-widest uppercase text-white/90">WorldPulse</span>
          </div>
          
          <button className="text-[10px] tracking-widest uppercase font-bold text-zinc-400 hover:text-white border border-white/10 px-4 py-2 rounded-full transition-all hover:bg-white/5">
            Subscribe to Newsletter
          </button>
        </div>
      </header>

      {/* Main Feed */}
      <main className="flex flex-col w-full max-w-2xl px-4 py-24 gap-12 relative z-10">
        {/* Status Section */}
        <section className="flex flex-col gap-1 items-center mb-4 text-center">
          <p className="text-[10px] tracking-[0.2em] font-bold text-zinc-500 uppercase leading-none">Intelligence Feed</p>
          <h1 className="text-4xl font-extrabold text-white/90 leading-tight">Latest High-Signal Events</h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent mt-4" />
        </section>

        {/* News Items */}
        <div className="flex flex-col gap-6">
          {mockFeed.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        {/* Footer info */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-zinc-600 font-medium">Auto-aggregated & Summarized every 6 hours</p>
          <p className="text-[10px] uppercase text-zinc-700 tracking-widest mt-2">Zero Search. Real Intelligence.</p>
        </footer>
      </main>

      {/* Cinematic Decorative Elements */}
      <div className="fixed bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none z-0" />
    </div>
  );
}
