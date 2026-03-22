"use client";

import { Flame, Wind, Heart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  voluntario: {
    nome: string;
    avatar_url: string | null;
    metros_linha: number;
    vidas_atuais: number;
    ofensiva_atual: number;
  } | null;
}

export default function TopBar({ voluntario }: TopBarProps) {
  const nome = voluntario?.nome || "Cria";
  const initials = nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const vidas = voluntario?.vidas_atuais ?? 5;
  const metros = voluntario?.metros_linha ?? 0;
  const ofensiva = voluntario?.ofensiva_atual ?? 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 w-full">
      {/* LUDIC CONTAINER - No more corporate glass bars. It's floating elements connected by a visual thread */}
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        
        {/* AVATAR + Name */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {voluntario?.avatar_url ? (
              <img
                src={voluntario.avatar_url}
                alt={nome}
                className="w-12 h-12 rounded-2xl border-4 border-white object-cover shadow-lg bg-orange-200"
                style={{ borderRadius: "var(--radius-kite)" }} // Custom kite shape
              />
            ) : (
              <div 
                className="w-12 h-12 border-4 border-white shadow-lg flex items-center justify-center text-sm font-black text-white bg-[var(--color-brand)]"
                style={{ borderRadius: "var(--radius-kite)" }}
              >
                {initials}
              </div>
            )}
          </div>
          
          <span className="text-lg font-display font-black text-white drop-shadow-md hidden min-[380px]:block truncate max-w-[90px]">
            {nome.split(" ")[0]}
          </span>
        </div>

        {/* METRICS - Like floating kite tails */}
        <div className="flex items-center gap-2">
          {/* Menu / Options */}
          <button className="w-12 h-12 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-full flex items-center justify-center text-white mr-1 active:scale-95 transition-transform hover:bg-white/30">
            <Menu className="w-6 h-6 stroke-[3px]" />
          </button>

          {/* Papéis de Seda (Vidas) */}
          <div className="flex flex-col items-center bg-white border-[3px] border-[#e5e5e5] px-3 py-1.5 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
            <Heart
              className="w-5 h-5 drop-shadow-sm"
              fill={vidas > 0 ? "var(--color-danger)" : "#e5e5e5"}
              color={vidas > 0 ? "var(--color-danger)" : "#a3a3a3"}
            />
            <span className={cn("text-xs font-black mt-0.5", vidas > 0 ? "text-[var(--color-danger)]" : "text-gray-400")}>
              {vidas}
            </span>
          </div>

          {/* Metros de Linha (XP) */}
          <div className="flex flex-col items-center bg-white border-[3px] border-[#e5e5e5] px-3 py-1.5 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
            <Wind className="w-5 h-5 text-[var(--color-info)] drop-shadow-sm" strokeWidth={3} />
            <span className="text-xs font-black mt-0.5 text-[var(--color-info)]">
              {metros}m
            </span>
          </div>

          {/* Chama (Ofensiva / Streak) */}
          <div className="flex flex-col items-center bg-white border-[3px] border-[#e5e5e5] px-3 py-1.5 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
            <Flame
              className="w-5 h-5 drop-shadow-sm"
              fill={ofensiva > 0 ? "var(--color-warning)" : "#e5e5e5"}
              color={ofensiva > 0 ? "var(--color-warning)" : "#a3a3a3"}
              strokeWidth={2}
            />
            <span className={cn("text-xs font-black mt-0.5", ofensiva > 0 ? "text-[var(--color-warning)]" : "text-gray-400")}>
              {ofensiva}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
