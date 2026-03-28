"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ShimmerCard() {
  return (
    <div className="flex flex-col h-[300px] border border-border/20 bg-card/40 rounded-xl p-4 gap-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Skeleton className="h-3.5 w-3.5 rounded-full bg-primary/20" />
          <Skeleton className="h-3 w-20 bg-muted/40" />
        </div>
        <Skeleton className="h-6 w-6 rounded-sm bg-muted/20" />
      </div>
      
      <div className="space-y-3 mt-2">
        <Skeleton className="h-5 w-full bg-muted/60" />
        <Skeleton className="h-5 w-[85%] bg-muted/40" />
      </div>

      <div className="space-y-2 mt-4 flex-1">
        <Skeleton className="h-3 w-full bg-muted/20" />
        <Skeleton className="h-3 w-full bg-muted/20" />
        <Skeleton className="h-3 w-[60%] bg-muted/20" />
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/10">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full bg-muted/40" />
          <Skeleton className="h-3 w-16 bg-muted/40" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md bg-primary/10" />
      </div>
    </div>
  );
}

export function ShimmerFeed() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-7xl mx-auto px-1 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <ShimmerCard key={i} />
      ))}
    </div>
  );
}
