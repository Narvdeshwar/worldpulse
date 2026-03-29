"use client";

import { NewsItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Copy, Clock, ExternalLink, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NewsCardProps {
  item: NewsItem;
  className?: string;
}

export function NewsCard({ item, className }: NewsCardProps) {
  const [copied, setCopied] = useState(false);
  const [localTime, setLocalTime] = useState(item.timestamp);

  useEffect(() => {
    try {
      const date = new Date(item.timestamp);
      if (!isNaN(date.getTime())) {
        const formatted = new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(date);
        setLocalTime(formatted);
      }
    } catch (e) {
      // Keep original if parsing fails
    }
  }, [item.timestamp]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${item.title}\n\n${item.summary}\n\nSource: ${item.source} (${localTime})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "group relative flex flex-col h-full p-4 sm:p-6 bg-card backdrop-blur-2xl rounded-2xl border border-border/60 transition-all duration-700",
      "hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_40px_rgba(20,255,180,0.1)] hover:-translate-y-2 overflow-hidden",
      className
    )}>
      {/* 🧬 Neural Glow Ingress */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary-glow),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <div className="relative z-10 flex flex-col h-full">
        <header className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary-glow)]" />
            <span className="text-[12px] font-medium text-primary/95">
              {item.source}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9 transition-all rounded-lg bg-secondary/50 border border-border hover:bg-primary/20 hover:border-primary/40", copied ? "text-green-500 dark:text-green-400" : "text-muted-foreground hover:text-primary")}
            onClick={copyToClipboard}
          >
            {copied ? <span className="text-[11px] font-medium">OK</span> : <Copy className="h-4 w-4" />}
          </Button>
        </header>

        <h3 className="text-[16px] font-semibold leading-snug text-foreground mb-4 group-hover:text-primary transition-colors duration-500">
          {item.title}
        </h3>

        <p className="text-[14px] leading-relaxed text-muted-foreground/90 font-normal mb-8 line-clamp-4 flex-grow italic border-l-3 border-primary/20 pl-5 py-2">
          {item.summary?.replace(/<[^>]*>/g, '') || "No summary available."}
        </p>

        <footer className="flex items-center justify-between pt-5 mt-auto border-t border-border/40">
          <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground/60 font-black uppercase tracking-widest">
            <Clock className="h-3.5 w-3.5 text-primary/50" />
            <span>{localTime}</span>
          </div>
          <button 
            className="group/link flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-primary/80 hover:text-primary transition-all"
            onClick={() => window.open(item.url, "_blank")}
          >
            <span>Read Intel</span>
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
          </button>
        </footer>
      </div>
    </div>
  );
}
