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

  // Perform actual filtering in the browser
  const filteredFeed = useMemo(() => {
    if (currentCategory === "all") return initialFeed;
    return initialFeed.filter(item => {
      // Robust slug matching (e.g. "NASA News-Release" -> "nasa")
      const sourceId = item.source.toLowerCase().split(' ')[0];
      return sourceId === currentCategory;
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
        <div className="grid w-full gap-3 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {filteredFeed.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
