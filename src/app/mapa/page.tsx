"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMapaData } from "@/lib/actions/gamification";
import TopBar from "@/components/map/TopBar";
import WorldCard from "@/components/map/WorldCard";

interface MundoCeu {
  id: number;
  nome_tema: string;
  clima_visual: string;
  cor_fase: string;
  ordem: number;
  descricao?: string;
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
  const [progressos, setProgressos] = useState<Progresso[]>([]);
  const [voluntario, setVoluntario] = useState<Voluntario | null>(null);
  const [nextRechargeSeconds, setNextRechargeSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMapaData();
        setMundos(data.mundos);
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
    return (prog?.status as "bloqueado" | "ativo" | "concluido") || "bloqueado";
  }

  function getWorldScore(mundoId: number): number {
    const prog = progressos.find((p) => p.mundo_id === mundoId);
    return prog?.pontuacao_local || 0;
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
    <div className="relative min-h-dvh bg-[var(--color-storm-dark)]">
      {/* Fixed Top Bar */}
      <TopBar voluntario={voluntario} nextRechargeSeconds={nextRechargeSeconds} />

      {/* World Cards List */}
      <main className="flex flex-col gap-6 p-5 pt-28 pb-28">
        {/* Section Title */}
        <div className="text-center mb-2">
          <h1 className="font-display font-black text-2xl text-white uppercase tracking-wide">
            Mapa dos Céus
          </h1>
          <p className="text-white/50 text-sm font-medium mt-1">
            Desbloqueie cada mundo completando suas fases
          </p>
        </div>

        {/* Cards */}
        {mundos.map((mundo) => (
          <WorldCard
            key={mundo.id}
            mundo={mundo}
            status={getWorldStatus(mundo.id)}
            score={getWorldScore(mundo.id)}
            onNavigate={(id) => router.push(`/trilha/${id}`)}
          />
        ))}
      </main>
    </div>
  );
}
