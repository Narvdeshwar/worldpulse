"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ShimmerCard() {
  return (
    <div className="flex flex-col h-[300px] border border-white/5 bg-slate-900/20 backdrop-blur-xl rounded-xl p-4 gap-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="flex gap-2.5 items-center">
          <Skeleton className="h-2 w-2 rounded-full bg-primary/40 animate-pulse" />
          <Skeleton className="h-2.5 w-16 bg-primary/10" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md bg-white/5" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-full bg-white/10" />
        <Skeleton className="h-6 w-[70%] bg-white/10" />
      </div>

      <div className="space-y-2 flex-grow pl-4 border-l-2 border-white/5 py-1">
        <Skeleton className="h-3 w-full bg-white/5" />
        <Skeleton className="h-3 w-full bg-white/5" />
        <Skeleton className="h-3 w-[60%] bg-white/5" />
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full bg-white/5" />
          <Skeleton className="h-2.5 w-12 bg-white/5" />
        </div>
        <Skeleton className="h-4 w-20 rounded-md bg-primary/10" />
      </div>
    </div>
  );
}

export function ShimmerFeed() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl mx-auto px-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <ShimmerCard key={i} />
      ))}
    </div>
  );
}
