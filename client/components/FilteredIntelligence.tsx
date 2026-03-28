"use client";

import { NewsItem } from "@/lib/types";
import { NewsCard } from "@/components/NewsCard";
import { CategoryNav } from "@/components/CategoryNav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";

interface FilteredIntelligenceProps {
  initialFeed: NewsItem[];
}

export function FilteredIntelligence({ initialFeed }: FilteredIntelligenceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get("category") || "all";

  // Dynamically extract unique sources for the nav
  const activeSources = useMemo(() =>
    Array.from(new Set(initialFeed.map(item => item.source))),
    [initialFeed]
  );

  // Absolute client-side chronological sort (Final Safeguard)
  const filteredFeed = useMemo(() => {
    const raw = currentCategory === "all" 
      ? initialFeed 
      : initialFeed.filter(item => {
          const sourceId = item.source.toLowerCase().split(' ')[0];
          return sourceId === currentCategory;
        });

    return [...raw].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      // DESC order: Higher timestamp (most recent) comes first
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
  }, [initialFeed, currentCategory]);

  return (
    <div className="flex flex-col">
      <div className="sticky top-18 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-3 border-b border-border/20 mb-3 -mx-3">
        <CategoryNav activeSources={activeSources} />
      </div>

      {filteredFeed.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center gap-3">
          <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No Intel Matching Selection</p>
          <Button
            variant="outline"
            size="sm"
            className="h-8 uppercase tracking-widest text-[10px] font-bold"
            onClick={() => router.push("/")}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
          {filteredFeed.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
