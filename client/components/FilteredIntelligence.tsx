"use client";

import { NewsItem } from "@/lib/types";
import { NewsCard } from "@/components/NewsCard";
import { CategoryNav } from "@/components/CategoryNav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useTransition } from "react";
import { Loader2 } from "lucide-react";

interface FilteredIntelligenceProps {
  initialFeed: NewsItem[];
}

export function FilteredIntelligence({ initialFeed }: FilteredIntelligenceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentCategory = searchParams.get("category") || "all";

  const onCategoryChange = (id: string) => {
    startTransition(() => {
      const url = id === "all" ? "/" : `/?category=${id}`;
      router.push(url);
    });
  };

  // Dynamically extract unique sources for the nav
  const activeSources = useMemo(() =>
    Array.from(new Set(initialFeed.map(item => item.source))),
    [initialFeed]
  );

  // Strategic Signal Processing
  const filteredFeed = useMemo(() => {
    let raw = initialFeed;

    if (currentCategory === "research") {
      raw = initialFeed.filter(item => 
        item.source.toLowerCase().includes("research") || 
        item.title.toLowerCase().includes("paper") || 
        item.title.toLowerCase().includes("study")
      );
    } else if (currentCategory !== "all") {
      raw = initialFeed.filter(item => {
        const sourceId = item.source.toLowerCase().split(' ')[0];
        return sourceId === currentCategory;
      });
    }

    return [...raw].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
  }, [initialFeed, currentCategory]);

  return (
    <div className="flex flex-col relative">
      <div className="sticky top-[4.5rem] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-3 border-b border-border/20 mb-3 -mx-3 transition-colors duration-300">
        <CategoryNav 
          activeSources={activeSources} 
          onCategoryChange={onCategoryChange} 
          isPending={isPending} 
        />
      </div>

      <div className={cn(
        "transition-all duration-500",
        isPending ? "opacity-30 blur-[2px] pointer-events-none scale-[0.98]" : "opacity-100"
      )}>
        {filteredFeed.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center gap-4 animate-in fade-in zoom-in duration-700">
            <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
              <Loader2 className="h-8 w-8 text-primary/40 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[12px]">No Signal Detected</p>
              <p className="text-[10px] text-muted-foreground/40 uppercase font-bold">Try adjusting tactical parameters</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-6 uppercase tracking-widest text-[11px] font-black mt-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              onClick={() => onCategoryChange("all")}
            >
              Reset Hub
            </Button>
          </div>
        ) : (
          <div className="grid w-full gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-[1600px] mx-auto px-4 pb-20 mt-4 transition-all duration-700">
            {filteredFeed.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {isPending && (
        <div className="fixed inset-x-0 top-1/2 -mt-10 z-[100] flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-primary/20 animate-ping opacity-20" />
          </div>
          <span className="text-[11px] uppercase font-black tracking-[0.4em] text-primary animate-pulse ml-0.5">Synchronizing AI Core...</span>
        </div>
      )}
    </div>
  );
}
