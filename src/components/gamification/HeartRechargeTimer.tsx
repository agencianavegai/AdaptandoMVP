"use client";

import { useState, useEffect } from "react";
import { Heart, Clock } from "lucide-react";

interface HeartRechargeTimerProps {
  nextRechargeSeconds: number;
  currentVidas: number;
  onRecharge?: () => void;
}

export default function HeartRechargeTimer({ nextRechargeSeconds, currentVidas, onRecharge }: HeartRechargeTimerProps) {
  const [seconds, setSeconds] = useState(nextRechargeSeconds);

  useEffect(() => {
    setSeconds(nextRechargeSeconds);
  }, [nextRechargeSeconds]);

  useEffect(() => {
    if (seconds <= 0 || currentVidas >= 5) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onRecharge?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, currentVidas, onRecharge]);

  if (currentVidas >= 5) return null;

  const displaySeconds = Math.max(0, seconds);
  const minutes = Math.floor(displaySeconds / 60);
  const secs = displaySeconds % 60;

  return (
    <div className="flex flex-col items-center gap-3 bg-black/40 backdrop-blur-md rounded-3xl border-2 border-white/20 px-6 py-5 shadow-2xl animate-slide-up">
      {/* Hearts Display */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Heart
            key={i}
            className="w-5 h-5 transition-all"
            fill={i < currentVidas ? "var(--color-danger)" : "#374151"}
            color={i < currentVidas ? "var(--color-danger)" : "#374151"}
          />
        ))}
      </div>

      {/* Timer or Reloading text */}
      <div className="flex items-center gap-2 text-white">
        <Clock className="w-4 h-4 text-[var(--color-info)] animate-pulse" />
        <span className="font-display font-black text-lg tracking-wider tabular-nums">
          {displaySeconds > 0 
            ? `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
            : "Recarregando..."}
        </span>
      </div>

      <p className="text-white/60 text-xs font-semibold text-center leading-tight max-w-[180px]">
        {displaySeconds > 0 ? "Próximo Papel de Seda em breve!" : "Verificando seus fios..."}
      </p>
    </div>
  );
}
