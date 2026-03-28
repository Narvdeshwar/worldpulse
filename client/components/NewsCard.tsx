"use client";

import { NewsItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Copy, Clock, ExternalLink, Globe } from "lucide-react";
import { useState } from "react";
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${item.title}\n\n${item.summary}\n\nSource: ${item.source} (${item.timestamp})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn(
      "flex flex-col h-full transition-all duration-200",
      "border border-border/40 bg-card hover:border-primary/30 hover:bg-muted/5",
      className
    )}>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-primary/70" />
            <Badge 
              variant="outline" 
              className="text-[10px] font-semibold tracking-tight uppercase border-none p-0 text-muted-foreground"
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

      <CardContent className="flex-1 pb-6">
        <p className="text-sm leading-relaxed text-muted-foreground font-medium line-clamp-3 italic decoration-primary/10">
          "{item.summary}"
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-4 mt-auto border-t border-border/30">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold">
            <Clock className="h-3 w-3" />
            <span>{item.timestamp}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 text-[11px] font-bold uppercase tracking-wider gap-1.5 transition-all border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
            onClick={() => window.open(item.url, "_blank")}
          >
            <span>Read Full Intelligence</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
