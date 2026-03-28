"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  activeSources: string[];
}

export function CategoryNav({ activeSources }: CategoryNavProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";

  const categories = [
    { id: "all", name: "All Intelligence" },
    ...activeSources.map(source => {
      // Create a short ID from source: e.g. "BBC News" -> "bbc"
      const id = source.toLowerCase().split(' ')[0];
      return { id, name: source, fullSource: source };
    })
  ];

  return (
    <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-hide py-3 cursor-default w-full">
      <div className="flex items-center justify-center gap-2 min-w-max mx-auto px-4">
        {categories.map((cat) => (
          <Link
          key={cat.id}
          href={cat.id === "all" ? "/" : `/?category=${cat.id}`}
          className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all border whitespace-nowrap",
            currentCategory === cat.id
              ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              : "bg-background/20 text-muted-foreground border-border/40 hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          {cat.name}
        </Link>
        ))}
      </div>
    </div>
  );
}
