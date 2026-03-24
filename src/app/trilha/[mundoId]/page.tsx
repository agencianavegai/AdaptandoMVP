"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTrilhaData } from "@/lib/actions/gamification";
import { Lock, Check, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicSkyBackground } from "@/components/ui/DynamicSkyBackground";
import StoryModal from "@/components/ui/StoryModal";
import { WORLD_LORE } from "@/lib/constants/lore";

interface Fase {
  id: string;
  titulo: string;
  ordem: number;
}

interface Progresso {
  pilula_atual: number;
  status: string;
  pontuacao_local: number;
}

interface Mundo {
  id: number;
  nome_tema: string;
  clima_visual: string;
  cor_fase: string;
  ordem: number;
}

export default function TrilhaPage() {
  const params = useParams();
  const router = useRouter();
  const mundoId = Number(params.mundoId);

  const [mundo, setMundo] = useState<Mundo | null>(null);
  const [fases, setFases] = useState<Fase[]>([]);
  const [progresso, setProgresso] = useState<Progresso | null>(null);
  const [voluntario, setVoluntario] = useState<{vidas_atuais: number; last_heart_lost: string | null} | null>(null);
  const [nextRechargeSeconds, setNextRechargeSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await getTrilhaData(mundoId);
      setMundo(data.mundo);
      setFases(data.fases);
      setProgresso(data.progresso);
      setVoluntario(data.voluntario);
      setNextRechargeSeconds(data.nextRechargeSeconds);
    } catch {
      router.push("/mapa");
    } finally {
      setLoading(false);
    }
  }, [mundoId, router]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Lore Modal First View
  useEffect(() => {
    if (!loading && mundo) {
      const storageKey = `lore_visto_mundo_${mundo.ordem}`;
      const hasSeenLore = localStorage.getItem(storageKey);
      
      if (!hasSeenLore) {
        setIsStoryModalOpen(true);
        localStorage.setItem(storageKey, "true");
      }
    }
  }, [loading, mundo]);

  // Auto-scroll to the bottom after loading (the journey starts from the bottom)
  useEffect(() => {
    if (!loading && bottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "instant" });
      }, 100);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-dvh gradient-storm flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-[var(--color-brand)] rounded-[var(--radius-kite)] flex items-center justify-center animate-float shadow-[0_8px_0_0_var(--color-brand-shadow)]">
          <span className="text-4xl">🪁</span>
        </div>
        <p className="text-white font-display font-black text-xl mt-6 uppercase tracking-wide">
          Armando a linha...
        </p>
      </div>
    );
  }

  if (!mundo || !progresso) {
    router.push("/mapa");
    return null;
  }

  const currentFase = progresso.pilula_atual;
  const isWorldComplete = progresso.status === "concluido";
  const totalFases = 6;
  const completedFases = isWorldComplete ? totalFases : currentFase - 1;
  const vidasAtuais = voluntario?.vidas_atuais ?? 0;
  const noLives = vidasAtuais <= 0;

  function getFaseStatus(ordem: number): "bloqueada" | "ativa" | "concluida" {
    if (isWorldComplete) return "concluida";
    if (ordem < currentFase) return "concluida";
    if (ordem === currentFase) return "ativa";
    return "bloqueada";
  }

  return (
    <DynamicSkyBackground mundoId={mundo.ordem}>
      {/* Back Button */}
      <button
        onClick={() => router.push("/mapa")}
        aria-label="Voltar para o Mapa"
        title="Voltar"
        className="fixed top-4 left-4 z-50 bg-black/30 backdrop-blur-md text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-2 border-white/20 hover:bg-black/50 transition-all"
      >
        ←
      </button>

      {/* Header */}
      <div className="pt-20 pb-6 text-center">
        <span className="text-xs font-black text-white/60 uppercase tracking-widest bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
          Céu {mundo.ordem} — {mundo.clima_visual}
        </span>
        <h1 className="font-display font-black text-3xl text-white mt-4 drop-shadow-lg uppercase">
          {mundo.nome_tema}
        </h1>
        <p className="text-white/60 font-medium mt-2 mb-4">
          {completedFases}/{totalFases} Pipas empinadas
        </p>

        {/* Manual Reopen Story Button */}
        <button
          onClick={() => setIsStoryModalOpen(true)}
          className="inline-flex items-center gap-2 bg-black/20 hover:bg-black/40 text-white/90 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors border border-white/10"
        >
          <BookOpen className="w-4 h-4" />
          <span className="font-display font-bold text-sm uppercase tracking-wide">
            Ler História
          </span>
        </button>
      </div>


      {/* Mosaico Reward */}
      <div className="mx-auto max-w-xs px-6 mb-10">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20" style={{ aspectRatio: '3/2' }}>
          <div className="absolute inset-0 gradient-brand opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">{isWorldComplete ? "🏆" : "🪁"}</span>
          </div>
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
            {Array.from({ length: totalFases }, (_, i) => {
              const faseNum = i + 1;
              const isRevealed = faseNum <= completedFases;
              return (
                <div
                  key={i}
                  className={cn(
                    "border border-white/10 transition-all duration-700",
                    isRevealed ? "bg-transparent" : "bg-gray-900/80 backdrop-blur-sm"
                  )}
                >
                  {!isRevealed && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trilha Path */}
      <div className="flex flex-col-reverse items-center pb-32 px-6 gap-0">
        <div ref={bottomRef} />
        {fases.map((fase, index) => {
          const status = getFaseStatus(fase.ordem);
          const isActive = status === "ativa";
          const isCompleted = status === "concluida";
          const isLocked = status === "bloqueada";

          const direction = index % 2 === 0 ? -1 : 1;
          const translateX = direction * 30;

          return (
            <div key={fase.id} className="relative flex flex-col items-center">
              {index < fases.length - 1 && (
                <div className="kite-line h-16 w-0 my-1 opacity-60" />
              )}

              <div
                className="relative group transition-transform duration-300"
                style={{ transform: `translateX(${translateX}px)` }}
              >
                <button
                  disabled={isLocked}
                  onClick={() => {
                    if (isLocked) return;
                    router.push(`/arena/${mundoId}?fase=${fase.ordem}`);
                  }}
                  className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-[var(--radius-kite)] flex items-center justify-center text-white border-[3px] border-white transition-all",
                    isLocked 
                      ? "bg-black/20 border-black/10 cursor-not-allowed opacity-60"
                      : isCompleted
                      ? "bg-emerald-500 shadow-[0_6px_0_0_#059669] hover:scale-105 cursor-pointer"
                      : "bg-[var(--color-brand)] shadow-[0_6px_0_0_var(--color-brand-shadow)] hover:scale-110 cursor-pointer",
                    isActive && "ring-6 ring-white/40 animate-pulse-glow"
                  )}
                >
                  {isLocked ? (
                    <Lock className="w-6 h-6 text-white/40" strokeWidth={3} />
                  ) : isCompleted ? (
                    <Check className="w-7 h-7 text-white" strokeWidth={4} />
                  ) : (
                    <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
                  )}
                </button>

                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 pointer-events-none w-max z-10",
                    direction <= 0 ? "left-[calc(100%+12px)]" : "right-[calc(100%+12px)]"
                  )}
                >
                  <div className={cn(
                    "font-display flex flex-col drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
                    direction <= 0 ? "items-start" : "items-end"
                  )}>
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm mb-1 whitespace-nowrap">
                      Pipa {fase.ordem}
                    </span>
                    <h3 className={cn(
                      "text-sm sm:text-base font-black text-white max-w-[130px] sm:max-w-[160px] line-clamp-2 leading-tight",
                      direction <= 0 ? "text-left" : "text-right"
                    )}>
                      {fase.titulo}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mundo && WORLD_LORE[mundo.ordem] && (
        <StoryModal 
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          title={WORLD_LORE[mundo.ordem].title}
          theme={WORLD_LORE[mundo.ordem].theme}
          description={WORLD_LORE[mundo.ordem].description}
        />
      )}
    </DynamicSkyBackground>
  );
}
