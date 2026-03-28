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
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
        <div className="space-y-1">
          <CardTitle className="text-xl">
            {item.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase px-2 py-0 h-4">
              {item.source}
            </Badge>
            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 shrink-0", copied && "text-green-500")}
          onClick={copyToClipboard}
        >
          {copied ? (
            <span className="text-[10px] font-bold">OK</span>
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">
          {item.summary}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4">
        <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground gap-1.5">
          <span>Read more</span>
          <ExternalLink className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
