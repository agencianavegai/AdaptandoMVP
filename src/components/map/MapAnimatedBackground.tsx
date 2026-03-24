"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MapAnimatedBackgroundProps {
  maxMundoId: number;
  className?: string;
}

export default function MapAnimatedBackground({ maxMundoId, className }: MapAnimatedBackgroundProps) {
  // Determine climate phase based on progression
  // 1-2: Storm (Tempestade)
  // 3-8: Clear/Opening Skies (Nuvens a abrir)
  // 9-10: Radiant (Laranja Ádapo)
  
  const phase = useMemo(() => {
    if (maxMundoId <= 2) return "storm";
    if (maxMundoId >= 9) return "radiant";
    return "clear";
  }, [maxMundoId]);

  return (
    <div className={cn("fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-1000", className)}>
      
      {/* 1. LAYER BASE: The actual animated gradients */}
      <div className="absolute inset-0">
        
        {/* STORM PHASE */}
        <div 
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-[#1a1c29] to-[#2c314a]",
            phase === "storm" ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent animate-pulse-slow" style={{ animationDelay: '5s' }}></div>
        </div>

        {/* CLEAR SKIES PHASE */}
        <div 
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-blue-500 to-sky-300",
            phase === "clear" ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Volumetric cloud-like blobs panning */}
          <div className="absolute -inset-[30%] w-[160%] h-[160%] opacity-40 animate-pan-clouds bg-gradient-to-tr from-white/0 via-white/30 to-white/0 rounded-[100%] blur-3xl"></div>
          <div className="absolute -inset-[30%] w-[160%] h-[160%] opacity-30 animate-pan-clouds bg-gradient-to-bl from-white/0 via-white/40 to-white/0 rounded-[100%] blur-2xl" style={{ animationDelay: '-30s' }}></div>
        </div>

        {/* RADIANT PHASE (ÁDAPO) */}
        <div 
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-[#ff7f06] to-amber-300",
            phase === "radiant" ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-pink-600/30 to-transparent mix-blend-overlay"></div>
          <div className="absolute inset-0 animate-radiant-pulse bg-[radial-gradient(circle_at_bottom_center,_var(--tw-gradient-stops))] from-yellow-200/50 via-[#ff9e40]/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20 bg-white blur-[100px] rounded-full mix-blend-overlay animate-pulse-slow"></div>
        </div>

      </div>

      {/* 2. LAYER OVERLAY: Guarantee UI Contrast on top of any phase */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      
    </div>
  );
}
