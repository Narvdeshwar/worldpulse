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

  // 🧬 News Categories
  const baseCategories = [
    { id: "all", name: "All Topics" },
    { id: "research", name: "Research" } 
  ];

  const sourceCategories = activeSources
    .map(source => {
      const id = source.toLowerCase().split(' ')[0];
      return { id, name: source };
    })
    .filter(cat => !baseCategories.find(bc => bc.id === cat.id));

  const categories = [...baseCategories, ...sourceCategories];

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center overflow-x-auto pb-4 scrollbar-hide py-3 cursor-default w-full mask-fade-right">
        <div className="flex items-center gap-3 min-w-max mx-auto px-6">
          {categories.map((cat) => (
            <button
            key={cat.id}
            disabled={isPending}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "px-5 py-2 rounded-lg text-[13px] font-medium transition-all border whitespace-nowrap cursor-pointer",
              currentCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background/20 text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5 shadow-sm"
            )}
          >
            {isPending && currentCategory === cat.id ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              cat.name
            )}
          </button>
          ))}
        </div>
      </div>
    </div>
  );
}
