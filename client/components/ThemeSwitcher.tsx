"use client";

import { useEffect, useState } from "react";
import { Settings, Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const themes = [
  { id: "emerald", name: "Emerald Insight", color: "bg-[#14FFB4]" },
  { id: "ruby", name: "Ruby Breach", color: "bg-[#FF3E3E]" },
  { id: "amber", name: "Solar Amber", color: "bg-[#FFB414]" },
  { id: "obsidian", name: "Void Obsidian", color: "bg-[#F0F0F0]" },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("emerald");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wp-theme") || "emerald";
      setCurrentTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
      document.body.setAttribute("data-theme", saved);
    } catch (e) {
      console.error("Theme recovery failed", e);
    }
  }, []);

  const setTheme = (id: string) => {
    setCurrentTheme(id);
    document.documentElement.setAttribute("data-theme", id);
    document.body.setAttribute("data-theme", id);
    localStorage.setItem("wp-theme", id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/20 hover:border-primary/40 transition-all duration-500 group"
        >
          <Settings className="h-5 w-5 text-primary/80 group-hover:rotate-90 transition-transform duration-700" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 bg-card/95 backdrop-blur-2xl border-primary/20 p-2 rounded-xl shadow-xl">
        <DropdownMenuLabel className="text-[12px] font-semibold text-muted-foreground/60 px-2 py-3 flex items-center gap-2">
          <Palette className="h-3.5 w-3.5" />
          Change Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-primary/10 mx-1" />
        <div className="grid grid-cols-1 gap-1 pt-1">
          {themes.map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300",
                currentTheme === theme.id ? "bg-primary/10 text-primary" : "text-muted-foreground/70 hover:bg-white/5 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("h-3 w-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]", theme.color)} />
                <span className="text-[12px] font-bold tracking-tight">{theme.name}</span>
              </div>
              {currentTheme === theme.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
