"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import TopBar from "@/components/map/TopBar";
import SkyWorld from "@/components/map/SkyWorld";
import { X } from "lucide-react";

interface MundoCeu {
  id: number;
  nome_tema: string;
  clima_visual: string;
  cor_fase: string;
  ordem: number;
  descricao?: string; // If this exists
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
  const [loading, setLoading] = useState(true);
  
  // For the active/clicked world details modal
  const [selectedWorld, setSelectedWorld] = useState<MundoCeu | null>(null);
  
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    async function loadData() {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Parallel fetch
      const [mundosRes, progressoRes, voluntarioRes] = await Promise.all([
        supabase.from("mundo_ceus").select("*").eq("ativo", true).order("ordem", { ascending: true }),
        supabase.from("progresso").select("*").eq("voluntario_id", user.id),
        supabase.from("voluntarios").select("*").eq("id", user.id).single(),
      ]);

      if (mundosRes.data) setMundos(mundosRes.data);
      if (progressoRes.data) setProgressos(progressoRes.data);
      if (voluntarioRes.data) setVoluntario(voluntarioRes.data);
      setLoading(false);
    }

    loadData();
  }, []);

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
      <div className="min-h-dvh gradient-storm flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 bg-[var(--color-brand)] rounded-[var(--radius-kite)] flex items-center justify-center animate-float shadow-[0_8px_0_0_var(--color-brand-shadow)]">
          <span className="text-5xl">🪁</span>
        </div>
        <h2 className="text-white font-display font-black text-2xl tracking-wide uppercase">
          Enchendo a laje...
        </h2>
      </div>
    );
  }

  // Reverse the map so Mundo 1 is at the bottom of the scroll container
  // We use flex-col-reverse on the container
  return (
    <div className="relative min-h-dvh map-scroll-bg bg-fixed">
      {/* Fixed Top Bar */}
      <TopBar voluntario={voluntario} />

      {/* Main Map Area - Full height, scrolling */}
      {/* We add plenty of padding at the bottom (pt-32 for TopBar, pb-32 for starting space) */}
      <main className="flex flex-col-reverse items-center justify-start min-h-dvh w-full pb-32 pt-40 overflow-x-hidden">
        
        {/* SkyWorlds - The Array is mapped normally, but flex-col-reverse renders index 0 at the bottom */}
        {mundos.map((mundo, index) => (
          <SkyWorld
            key={mundo.id}
            mundo={mundo}
            status={getWorldStatus(mundo.id)}
            score={getWorldScore(mundo.id)}
            index={index}
            isLast={index === mundos.length - 1} // Index lengths match since it's just visually reversed
            onOpenInfo={(m) => setSelectedWorld(m)}
          />
        ))}

        {/* Start Point / Base Anchor inside the scroll view */}
        <div className="mt-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-[var(--radius-kite)] bg-black/40 border-4 border-white/20 backdrop-blur-md flex flex-col items-center justify-center mb-6 shadow-2xl">
             <span className="text-3xl text-white/50">🏠</span>
          </div>
        </div>

      </main>

      {/* Bottom overlay for safe area */}
      <div className="fixed bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {/* MODAL / BOTTOM SHEET for World Info */}
      {selectedWorld && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 animate-slide-up relative"
            style={{ borderRadius: "32px" }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedWorld(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
            >
              <X strokeWidth={3} className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center mt-2">
              <div className="mx-auto w-20 h-20 bg-[var(--color-brand)] rounded-full flex items-center justify-center shadow-[0_6px_0_0_var(--color-brand-shadow)] mb-4">
                 <span className="text-white font-black text-2xl font-display">{selectedWorld.ordem}</span>
              </div>
              <h2 className="font-display font-black text-2xl text-[var(--color-text-primary)] mb-2 uppercase">
                {selectedWorld.nome_tema}
              </h2>
              <p className="text-[var(--color-text-secondary)] font-medium">
                Prepare-se para enfrentar o clima: <br/>
                <strong className="text-[var(--color-brand)]">{selectedWorld.clima_visual}</strong>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-4">
              <button 
                className="btn-3d-brand py-4 w-full text-lg"
                onClick={() => {
                  router.push(`/trilha/${selectedWorld.id}`);
                  setSelectedWorld(null);
                }}
              >
                Iniciar Desafio
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
