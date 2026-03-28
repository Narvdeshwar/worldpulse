"use client";

import { NewsItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Copy, Clock, ExternalLink } from "lucide-react";
import { useState } from "react";

interface NewsCardProps {
  item: NewsItem;
  className?: string;
}

export function NewsCard({ item, className }: NewsCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${item.title}\n\n${item.summary}\n\nSource: ${item.source} (${item.timestamp})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "glass-effect p-6 rounded-2xl flex flex-col gap-3 transition-all duration-300 hover:scale-[1.01] hover:glow-primary group",
        className
      )}
    >
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-xl font-bold text-white leading-tight tracking-tight">
          {item.title}
        </h3>
        <button
          onClick={copyToClipboard}
          className={cn(
            "p-2 rounded-lg transition-colors",
            copied ? "bg-green-500/20 text-green-400" : "bg-white/5 text-zinc-400 hover:text-white"
          )}
          title="Copy intelligence"
        >
          {copied ? (
            <span className="text-xs font-medium px-1">Copied!</span>
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <p className="text-zinc-300 text-sm leading-relaxed font-light">
        {item.summary}
      </p>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{item.timestamp}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>{item.source}</span>
          </div>
        </div>
        
        <button className="text-[10px] uppercase font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <span>Explore Source</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}
