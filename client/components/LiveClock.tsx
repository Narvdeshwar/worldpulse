"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState<string>("");
  const [timezone, setTimezone] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-end tabular-nums select-none opacity-80 hover:opacity-100 transition-opacity">
      <div className="text-[11px] font-black tracking-widest text-primary font-mono leading-none">
        {time || "00:00:00"}
      </div>
      <div className="text-[8px] uppercase font-bold tracking-tighter text-muted-foreground mt-1">
        {timezone || "UTC"}
      </div>
    </div>
  );
}
