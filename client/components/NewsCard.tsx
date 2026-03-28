"use client";

import { NewsItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Copy, Clock, ExternalLink } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card className={cn("transition-all duration-200 hover:border-primary/30", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
        <div className="space-y-1.5">
          <CardTitle className="text-xl leading-snug">
            {item.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            <Clock className="h-3 w-3" />
            <span>{item.timestamp}</span>
            <span className="h-1 w-1 rounded-full bg-muted" />
            <span>{item.source}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          className={cn("h-8 w-8 shrink-0", copied && "text-green-500 border-green-500/50")}
          onClick={copyToClipboard}
        >
          {copied ? (
            <span className="text-[10px] font-bold uppercase">OK</span>
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {item.summary}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
          <span>Explore Source</span>
          <ExternalLink className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
