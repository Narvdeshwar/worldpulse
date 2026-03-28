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
    <Card className={cn(
      "flex flex-col h-full transition-all duration-300",
      "border border-border/40 bg-card rounded-xl backdrop-blur-md",
      "hover:border-primary/50 hover:bg-card/90 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/5",
      className
    )}>
      <CardHeader className="space-y-3 p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <Badge 
              variant="outline" 
              className="text-[9px] font-black tracking-[0.1em] uppercase border-none p-0 text-muted-foreground"
            >
              {item.source}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 transition-colors rounded-sm", copied ? "text-green-500" : "text-muted-foreground/50 hover:text-foreground")}
            onClick={copyToClipboard}
          >
            {copied ? <span className="text-[10px] font-bold">OK</span> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
        
        <CardTitle className="text-xl font-bold leading-tight tracking-tight text-card-foreground">
          {item.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 px-3 py-2">
        <p className="text-[13px] leading-relaxed text-muted-foreground/80 font-medium line-clamp-4 italic decoration-primary/20">
          "{item.summary}"
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 p-3 mt-auto border-t border-border/20">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            <span>{localTime}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.15em] transition-all bg-primary/5 border-primary/20 hover:bg-primary hover:text-white hover:border-primary"
            onClick={() => window.open(item.url, "_blank")}
          >
            <span>Read Report</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
