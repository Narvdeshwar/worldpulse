"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export function SubscribeDialog() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const res = await fetch(`${apiUrl}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && setStatus("idle")}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider">
          Subscribe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-lg border-border/40">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Intelligence Newsletter</DialogTitle>
          <DialogDescription className="text-sm">
            Receive high-signal global intelligence reports at exactly 06:00 and 18:00 daily.
          </DialogDescription>
        </DialogHeader>
        
        {status === "success" ? (
          <div className="py-6 text-center space-y-2 animate-in fade-in zoom-in duration-300">
            <div className="text-primary font-bold text-lg">Signal Established.</div>
            <p className="text-muted-foreground text-sm">Welcome to the briefing. Your first report arrives at the next 06:00/18:00 tactical window.</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Your Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="analyst@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/30 border-border/40 focus:ring-primary/20"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full gap-2 font-bold uppercase tracking-widest text-xs h-10"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Activating..." : (
                <>
                  Connect Intelligence <Send className="h-3 w-3" />
                </>
              )}
            </Button>
            {status === "error" && (
              <p className="text-destructive text-[10px] text-center font-bold uppercase tracking-tighter">
                ⚠️ Connection failed. Please check your signal.
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
