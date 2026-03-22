"use client";

import { Lock, Check, CloudLightning, CloudRain, CloudDrizzle, CloudFog, Cloud, CloudSun, Sun, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkyWorldProps {
  mundo: {
    id: number;
    nome_tema: string;
    clima_visual: string;
    cor_fase: string;
    ordem: number;
  };
  status: "bloqueado" | "ativo" | "concluido";
  score: number;
  index: number;
  isLast: boolean;
  onOpenInfo: (mundo: any) => void;
}

const WEATHER_ICONS: Record<number, React.ReactNode> = {
  1: <CloudLightning className="w-8 h-8 drop-shadow-md" />,
  2: <CloudRain className="w-8 h-8 drop-shadow-md" />,
  3: <CloudDrizzle className="w-8 h-8 drop-shadow-md" />,
  4: <CloudFog className="w-8 h-8 drop-shadow-md" />,
  5: <Cloud className="w-8 h-8 drop-shadow-md" />,
  6: <CloudSun className="w-8 h-8 drop-shadow-md" />,
  7: <Sun className="w-8 h-8 drop-shadow-md text-yellow-100" />,
  8: <Sun className="w-8 h-8 drop-shadow-md text-yellow-100" />,
  9: <Wind className="w-8 h-8 drop-shadow-md text-cyan-100" />,
  10: <span className="text-4xl drop-shadow-md">🪁</span>,
};

const COR_MAPPING: Record<string, string> = {
  "Laranja": "bg-orange-500 shadow-orange-700",
  "Rosa": "bg-pink-500 shadow-pink-700",
  "Amarelo": "bg-yellow-400 shadow-yellow-600",
  "Roxo": "bg-purple-500 shadow-purple-700",
  "Azul Claro": "bg-sky-400 shadow-sky-600",
  "Azul Escuro": "bg-blue-600 shadow-blue-800",
  "Verde Claro": "bg-emerald-400 shadow-emerald-600",
  "Verde Escuro": "bg-green-600 shadow-green-800",
  "Laranja Escuro": "bg-amber-600 shadow-amber-800",
};

export default function SkyWorld({ mundo, status, score, index, isLast, onOpenInfo }: SkyWorldProps) {
  const isLocked = status === "bloqueado";
  const isCompleted = status === "concluido";
  const isActive = status === "ativo";

  const colorClass = COR_MAPPING[mundo.cor_fase] || "bg-gray-400 shadow-gray-600";
  const weatherIcon = WEATHER_ICONS[mundo.ordem] || <Cloud className="w-8 h-8" />;

  // Sinusoidal/Zigzag path calculation for the stations
  // Pure Left/Right zigzag ensures the button touches the center line 
  // and the text goes to the outside safely without overlapping the line.
  // index 0: Left (offset = -40px)
  // index 1: Right (offset = 40px)
  const pattern = [-1, 1];
  const direction = pattern[index % 2];
  const translateX = direction * 40; // pixels

  // Is the label on the left or the right of the node?
  const labelRight = direction <= 0;

  return (
    <div className="relative w-full flex flex-col items-center">

      {/* Visual Line connecting nodes (coming from the PREVIOUS world above it visually) */}
      {!isLast && (
        <div className="kite-line h-12 w-0 my-1 opcaity-80" />
      )}

      {/* The Node Content Container */}
      <div
        className="relative group transition-transform duration-300"
        style={{
          transform: `translateX(${translateX}px)`,
          zIndex: isActive ? 20 : 10
        }}
      >
        {/* Playful Start/Info Bubble (Only for active or completed) */}
        {!isLocked && (
          <button
            disabled={isLocked}
            onClick={() => onOpenInfo(mundo)}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-5 py-2.5 rounded-[var(--radius-card)] shadow-lg border-[3px] border-[#e5e5e5] animate-bounce-hover flex items-center justify-center gap-2 group-active:-translate-y-1 transition-all z-30"
          >
            <span className="font-display font-black text-[var(--color-brand)] uppercase tracking-wide text-sm whitespace-nowrap leading-none mt-0.5">
              {isActive ? "COMEÇAR" : "REVER"}
            </span>
          </button>
        )}

        {/* The 3D Floating Node */}
        <button
          disabled={isLocked}
          onClick={() => onOpenInfo(mundo)}
          className={cn(
            "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white border-[4px] border-white transition-all",
            isLocked
              ? "bg-black/20 shadow-black/40 border-black/10 cursor-not-allowed scale-95 opacity-80"
              : cn(colorClass, "hover:scale-105 active:scale-95 cursor-pointer"),
            // Inline style for the deep shadow bottom if active/completed
            !isLocked && "shadow-[0_8px_0_0_rgba(0,0,0,0.15)]",
            isActive && "ring-8 ring-white/40 ring-offset-4 ring-offset-[var(--color-brand)] animate-pulse-glow"
          )}
          style={{
            // Overriding box-shadow for the specific 3D Duolingo look based on color
            boxShadow: !isLocked ? `0 6px 0 0 var(--tw-shadow-color)` : '0 4px 0 0 rgba(0,0,0,0.2)',
            // For locked items, use a gray filter
            filter: isLocked ? 'grayscale(100%) opacity(70%)' : 'none'
          }}
        >
          {isLocked ? (
            <Lock className="w-8 h-8 text-white/50" strokeWidth={3} />
          ) : isCompleted ? (
            <div className="relative">
              {weatherIcon}
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 border-2 border-white shadow-sm">
                <Check className="w-4 h-4 text-white" strokeWidth={4} />
              </div>
            </div>
          ) : (
            weatherIcon
          )}
        </button>

        {/* Floating Title (Absolute positioned relative to node) */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 w-max z-10",
            labelRight
              ? "left-[calc(100%+12px)] origin-left"
              : "right-[calc(100%+12px)] origin-right",
            isLocked ? "opacity-50" : "opacity-100"
          )}
        >
          <div className={cn(
            "font-display flex flex-col drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
            labelRight ? "items-start" : "items-end"
          )}>
            <span className="text-[10px] sm:text-xs font-black text-white/90 uppercase tracking-widest bg-black/30 px-3 py-0.5 rounded-full backdrop-blur-sm mb-1.5 whitespace-nowrap inline-block shadow-sm">
              Mundo {mundo.ordem}
            </span>
            <h3 className={cn(
              "text-base sm:text-lg font-black text-white leading-tight break-words max-w-[140px] sm:max-w-[180px] line-clamp-2 text-shadow-sm",
              labelRight ? "text-left" : "text-right"
            )}>
              {mundo.nome_tema}
            </h3>
          </div>
        </div>

      </div>
    </div>
  );
}
