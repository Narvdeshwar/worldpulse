"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export function LiveOperatives() {
  const [count, setCount] = useState(1);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

  useEffect(() => {
    const syncOperatives = async () => {
      try {
        // 1. Send heartbeat to verify this agent is active
        await fetch(`${apiUrl}/api/heartbeat`, { method: "POST" });
        
        // 2. Fetch the absolute global count
        const res = await fetch(`${apiUrl}/api/operatives`);
        const data = await res.json();
        if (data.count) setCount(data.count);
      } catch (err) {
        console.warn("Operative sync failed. Connection lost.");
      }
    };

    syncOperatives();
    const interval = setInterval(syncOperatives, 15000); // 15s Pulse

    return () => clearInterval(interval);
  }, [apiUrl]);

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 bg-primary/20 border border-primary/40 rounded-md backdrop-blur-md shadow-[0_0_15px_rgba(249,115,22,0.1)] animate-in fade-in zoom-in duration-700">
      <div className="relative flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(249,115,22,1)]" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black tracking-tighter text-primary leading-none tabular-nums">
            {count.toLocaleString()}
          </span>
          <span className="text-[8px] bg-primary text-primary-foreground px-1 rounded-[2px] font-black tracking-widest leading-none py-0.5 scale-90 origin-left">
            LIVE
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/80 leading-none mt-0.5">
          Verified Operatives
        </span>
      </div>
    </div>
  );
}
