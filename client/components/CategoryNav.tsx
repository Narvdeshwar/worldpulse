"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface CategoryNavProps {
  activeSources: string[];
  onCategoryChange: (id: string) => void;
  isPending: boolean;
}

export function CategoryNav({ activeSources, onCategoryChange, isPending }: CategoryNavProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";

  // 🧬 Strategic Intelligence Categories (Expanded with explicit Research node)
  const baseCategories = [
    { id: "all", name: "AI Strategic Hub" },
    { id: "research", name: "Research" } // Explicit category requested
  ];

  const sourceCategories = activeSources
    .map(source => {
      const id = source.toLowerCase().split(' ')[0];
      return { id, name: source };
    })
    .filter(cat => !baseCategories.find(bc => bc.id === cat.id));

  const categories = [...baseCategories, ...sourceCategories];

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-center gap-3 overflow-x-auto pb-4 scrollbar-hide py-3 cursor-default w-full">
        <div className="flex items-center justify-center gap-3 min-w-max mx-auto px-4 relative">
          {categories.map((cat) => (
            <button
            key={cat.id}
            disabled={isPending}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] transition-all border whitespace-nowrap cursor-pointer",
              currentCategory === cat.id
                ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(20,255,180,0.4)]"
                : "bg-background/20 text-muted-foreground border-border/40 hover:border-primary/50 hover:bg-primary/5 shadow-sm"
            )}
          >
            {cat.name}
          </button>
          ))}
          
          {isPending && (
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-[10px] uppercase font-black tracking-widest text-primary animate-pulse">Syncing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
