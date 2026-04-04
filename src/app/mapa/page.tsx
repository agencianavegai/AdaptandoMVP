"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMapaData } from "@/lib/actions/gamification";
import TopBar from "@/components/map/TopBar";
import WorldCard from "@/components/map/WorldCard";
import MapAnimatedBackground from "@/components/map/MapAnimatedBackground";
import { useGameSound } from "@/hooks/useGameSound";

import { MapCarousel } from "@/components/map/MapCarousel";

interface MundoCeu {
  id: number;
  nome_tema: string;
  clima_visual: string;
  cor_fase: string;
  ordem: number;
  descricao?: string;
  game_mode: "quiz" | "crossword";
}

interface Progresso {
  mundo_id: number;
  status: string;
  pontuacao_local: number;
}

interface Voluntario {
  nome: string;
  avatar_url: string | null;
  metros_linha: number;
  vidas_atuais: number;
  ofensiva_atual: number;
}

export default function MapaPage() {
  const [mundos, setMundos] = useState<MundoCeu[]>([]);
  const [mundosByMode, setMundosByMode] = useState<{quiz: MundoCeu[], crossword: MundoCeu[]}>({ quiz: [], crossword: [] });
  const [progressos, setProgressos] = useState<Progresso[]>([]);
  const [voluntario, setVoluntario] = useState<Voluntario | null>(null);
  const [nextRechargeSeconds, setNextRechargeSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { playClick } = useGameSound();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMapaData();
        setMundos(data.mundos);
        setMundosByMode(data.mundosByMode as {quiz: MundoCeu[], crossword: MundoCeu[]});
        setProgressos(data.progressos);
        setVoluntario(data.voluntario);
        setNextRechargeSeconds(data.nextRechargeSeconds);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  function getWorldStatus(mundoId: number): "bloqueado" | "ativo" | "concluido" {
    const prog = progressos.find((p) => p.mundo_id === mundoId);
    if (prog) return (prog.status as "bloqueado" | "ativo" | "concluido");
    
    // Auto-unlock first world of any game mode
    const mundo = mundos.find(m => m.id === mundoId);
    if (mundo && mundo.ordem === 1) return "ativo";
    
    return "bloqueado";
  }

  function getWorldScore(mundoId: number): number {
    const prog = progressos.find((p) => p.mundo_id === mundoId);
    return prog?.pontuacao_local || 0;
  }

  // Determina o máximo mundo desbloqueado para o fundo dinâmico
  function getMaxMundoId(): number {
    const unlocked = progressos.filter((p) => p.status === "ativo" || p.status === "concluido");
    if (unlocked.length === 0) return 1;
    return Math.max(...unlocked.map((p) => p.mundo_id));
  }

  // Determina o foco/tema do usuário para compartilhar no modal
  function getCurrentFocus(): string | undefined {
    const maxId = getMaxMundoId();
    const curr = mundos.find((m) => m.id === maxId);
    return curr?.nome_tema;
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-[var(--color-storm-dark)] flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 bg-[var(--color-brand)] rounded-[var(--radius-kite)] flex items-center justify-center animate-float shadow-[0_8px_0_0_var(--color-brand-shadow)]">
          <span className="text-5xl">🪁</span>
        </div>
        <h2 className="text-white font-display font-black text-2xl tracking-wide uppercase">
          Passando cerol...
        </h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh">
      {/* Dynamic Animated Skies */}
      <MapAnimatedBackground maxMundoId={getMaxMundoId()} />

      {/* Fixed Top Bar */}
      <TopBar voluntario={voluntario} nextRechargeSeconds={nextRechargeSeconds} currentFocus={getCurrentFocus()} />

      <main className="relative z-10 flex flex-col items-center pt-28 pb-28">
        <MapCarousel
          slides={[
            {
              id: "quiz",
              label: "Quiz",
              icon: "⚔️",
              content: (
                <div className="flex flex-col gap-6 w-full px-5">
                  <div className="text-center mb-2">
                    <h1 className="font-display font-black text-2xl text-white uppercase tracking-wide">
                      Mapa dos Céus
                    </h1>
                    <p className="text-white/50 text-sm font-medium mt-1">
                      Desafio Contínuo de Quiz
                    </p>
                  </div>
                  {mundosByMode.quiz.map((mundo) => (
                    <WorldCard
                      key={mundo.id}
                      mundo={mundo}
                      status={getWorldStatus(mundo.id)}
                      score={getWorldScore(mundo.id)}
                      onNavigate={(id) => { playClick(); router.push(`/trilha/${id}`) }}
                    />
                  ))}
                  {mundosByMode.quiz.length === 0 && (
                    <p className="text-white/50 text-center italic py-10">Nenhum mundo encontrado.</p>
                  )}
                  {/* Espaçamento final mobile */}
                  <div className="h-6"></div>
                </div>
              ),
            },
            ...(mundosByMode.crossword.length > 0
              ? [
                  {
                    id: "crossword",
                    label: "Cruzadas",
                    icon: "🧩",
                    content: (
                      <div className="flex flex-col gap-6 w-full px-5">
                        <div className="text-center mb-2">
                          <h1 className="font-display font-black text-2xl text-white uppercase tracking-wide">
                            Multiverso
                          </h1>
                          <p className="text-white/50 text-sm font-medium mt-1">
                            Desafios de Palavras Cruzadas
                          </p>
                        </div>
                        {mundosByMode.crossword.map((mundo) => (
                          <WorldCard
                            key={mundo.id}
                            mundo={mundo}
                            status={getWorldStatus(mundo.id)}
                            score={getWorldScore(mundo.id)}
                            onNavigate={(id) => {
                              playClick();
                              router.push(`/cruzada/${id}`);
                            }}
                          />
                        ))}
                        {/* Espaçamento final mobile */}
                        <div className="h-6"></div>
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </main>
    </div>
  );
}
