"use client";

import { NewsItem } from "@/lib/types";
import { NewsCard } from "@/components/NewsCard";
import { CategoryNav } from "@/components/CategoryNav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useTransition, useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface FilteredIntelligenceProps {
  initialFeed: NewsItem[];
}

const ITEMS_PER_PAGE = 12;

export function FilteredIntelligence({ initialFeed }: FilteredIntelligenceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentCategory = searchParams.get("category") || "all";
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerTarget = useRef(null);

  const onCategoryChange = (id: string) => {
    setVisibleCount(ITEMS_PER_PAGE); // Reset scroll on category change
    startTransition(() => {
      const url = id === "all" ? "/" : `/?category=${id}`;
      router.push(url);
    });
  };

  // Reset locally when props change (e.g. initialFeed new reference)
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [currentCategory]);

  // ♾️ Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isPending) {
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isPending]);

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

  const displayedFeed = filteredFeed.slice(0, visibleCount);
  const hasMore = visibleCount < filteredFeed.length;

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
              <p className="text-muted-foreground font-semibold text-[16px]">No news found</p>
              <p className="text-[14px] text-muted-foreground/40 font-normal">Try adjusting your filters</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-6 font-medium text-[13px] mt-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              onClick={() => onCategoryChange("all")}
            >
              Show all news
            </Button>
          </div>
        ) : (
          <>
            <div className="grid w-full gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-[1600px] mx-auto px-4 pb-10 mt-4 transition-all duration-700">
              {displayedFeed.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
            
            {/* Sentinel for Scroll */}
            <div ref={observerTarget} className="h-20 w-full flex items-center justify-center">
              {hasMore && !isPending && (
                <div className="flex items-center gap-3 py-10 opacity-60">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-[13px] font-medium text-muted-foreground">Finding more news...</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isPending && (
        <div className="fixed inset-x-0 top-1/2 -mt-10 z-[100] flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <span className="text-[13px] font-medium text-primary animate-pulse">Updating feed...</span>
        </div>
      )}
    </div>
  );
}
