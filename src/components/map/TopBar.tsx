"use client";

import { useEffect, useState } from "react";
import { Flame, Wind, Heart, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  voluntario: {
    nome: string;
    avatar_url: string | null;
    metros_linha: number;
    vidas_atuais: number;
    ofensiva_atual: number;
  } | null;
  nextRechargeSeconds?: number;
}

function MiniTimer({ seconds }: { seconds: number }) {
  const [s, setS] = useState(seconds);

  useEffect(() => {
    setS(seconds);
  }, [seconds]);

  useEffect(() => {
    if (s <= 0) return;
    const interval = setInterval(() => {
      setS((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [s]);

  if (s <= 0) return <span>Recarregando...</span>;

  const m = Math.floor(s / 60);
  const sec = s % 60;
  return (
    <span className="flex items-center gap-0.5 text-[var(--color-info)] ml-1">
      <Clock className="w-2.5 h-2.5" />
      {String(m).padStart(2, "0")}:{String(sec).padStart(2, "0")}
    </span>
  );
}

export default function TopBar({ voluntario, nextRechargeSeconds = 0 }: TopBarProps) {
  const [showLivesModal, setShowLivesModal] = useState(false);

  const nome = voluntario?.nome || "Cria";
  const initials = nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const vidas = voluntario?.vidas_atuais ?? 5;
  const metros = voluntario?.metros_linha ?? 0;
  const ofensiva = voluntario?.ofensiva_atual ?? 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 w-full">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          
          {/* AVATAR + Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {voluntario?.avatar_url ? (
                <img
                  src={voluntario.avatar_url}
                  alt={nome}
                  className="w-12 h-12 rounded-2xl border-4 border-white object-cover shadow-lg bg-orange-200"
                  style={{ borderRadius: "var(--radius-kite)" }}
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

          {/* METRICS */}
          <div className="flex items-center gap-2">
            {/* Papéis de Seda (Vidas) — Clickable to open Modal */}
            <button 
              onClick={() => setShowLivesModal(true)}
              className="flex flex-col items-center bg-white border-[3px] border-[#e5e5e5] px-2.5 py-1.5 rounded-2xl shadow-sm transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer outline-none"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Heart
                    key={i}
                    className={cn("w-3.5 h-3.5 transition-all", i >= vidas && "opacity-30")}
                    fill={i < vidas ? "var(--color-danger)" : "#d1d5db"}
                    color={i < vidas ? "var(--color-danger)" : "#d1d5db"}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center mt-0.5">
                <span className={cn("text-[10px] font-black", vidas > 0 ? "text-[var(--color-danger)]" : "text-gray-400")}>
                  {vidas}/5
                </span>
                {vidas < 5 && nextRechargeSeconds > 0 && <MiniTimer seconds={nextRechargeSeconds} />}
              </div>
            </button>

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

      {/* Lives status modal */}
      {showLivesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 animate-slide-up relative text-center border-4 border-white/20">
            <button 
              onClick={() => setShowLivesModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <X strokeWidth={3} className="w-4 h-4" />
            </button>
            
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-inner mb-2 animate-bounce-hover">
              <Heart className="w-8 h-8 text-[var(--color-danger)]" fill="var(--color-danger)" />
            </div>
            
            <h2 className="font-display font-black text-2xl text-gray-900 uppercase">
              Papéis de Seda
            </h2>
            
            <div className="flex items-center gap-1.5 mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Heart
                  key={i}
                  className={cn("w-6 h-6 transition-all", i >= vidas ? "scale-90 opacity-30 grayscale" : "scale-100")}
                  fill={i < vidas ? "var(--color-danger)" : "#d1d5db"}
                  color={i < vidas ? "var(--color-danger)" : "#d1d5db"}
                />
              ))}
            </div>

            <p className="text-gray-600 font-medium leading-relaxed">
              Você tem <strong>{vidas}/5</strong> papéis de seda.<br/>
              Cada erro em um quiz custa 1 papel.
            </p>

            {vidas < 5 ? (
              <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 w-full mt-2 flex flex-col items-center">
                <p className="text-[10px] text-gray-500 mb-1 font-black uppercase tracking-wider">Próximo papel em:</p>
                <div className="flex items-center justify-center gap-2 text-[var(--color-info)]">
                  <span className="font-display font-black text-3xl tabular-nums">
                    <MiniTimer seconds={nextRechargeSeconds} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-4 w-full mt-2">
                <p className="text-sm text-green-600 font-black uppercase tracking-wider">Vidas Cheias!</p>
                <p className="text-green-700 text-xs mt-1 font-medium">Sua pipa está pronta para voar alto.</p>
              </div>
            )}

            <button 
              onClick={() => setShowLivesModal(false)}
              className="btn-3d-brand w-full py-4 mt-2 text-sm"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
