"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getCrosswordData, CrosswordGrid } from "@/lib/actions/crossword";
import { completeFase } from "@/lib/actions/gamification";
import { DynamicSkyBackground } from "@/components/ui/DynamicSkyBackground";
import { CrosswordBoard } from "@/components/game/CrosswordBoard";
import PillCard from "@/components/quiz/PillCard";
import ArenaResult from "@/components/quiz/ArenaResult";
import StreakCelebration from "@/components/gamification/StreakCelebration";
import { Settings } from "lucide-react";
import SettingsHubModal from "@/components/ui/SettingsHubModal";

interface Pilula {
  id: string;
  titulo: string;
  conteudo: string;
  ordem: number;
}

export default function CruzadaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const mundoId = Number(params.mundoId);
  const faseOrdem = Number(searchParams.get("fase") || "1");

  const [pilula, setPilula] = useState<Pilula | null>(null);
  const [gridData, setGridData] = useState<CrosswordGrid | null>(null);
  const [vidas, setVidas] = useState(5);
  const [metrosLinha, setMetrosLinha] = useState(0);
  const [nextRechargeSeconds, setNextRechargeSeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  // Steps: 0 = PillCard, 1 = Game, 2 = Result
  const [currentStep, setCurrentStep] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const [metrosGanhos, setMetrosGanhos] = useState(0);
  const [mundoConcluido, setMundoConcluido] = useState(false);
  const [streakData, setStreakData] = useState<{ count: number; isNew: boolean } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCrosswordData(mundoId, faseOrdem);
        setPilula(data.pilula);
        setGridData(data.grid);
        setVidas(data.vidas);
        setMetrosLinha(data.metrosLinha);
        setNextRechargeSeconds(data.nextRechargeSeconds || 0);
      } catch {
        router.push(`/trilha/${mundoId}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mundoId, faseOrdem, router]);

  const handlePillContinue = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleCrosswordComplete = useCallback(async () => {
    // Determine score based on lives remaining or simply fixed to total words
    // For now, let's just consider all words completed successfully.
    const score = gridData?.palavras.length || 0;
    
    try {
      // Optimistic completion
      const completion = await completeFase(mundoId, faseOrdem, score);
      setMundoConcluido(completion.mundoConcluido);
      if (completion.mundoConcluido) {
        setMetrosGanhos(50); // Crosswords might grant the same as normal quiz completion
      } else {
        setMetrosGanhos(10); // Standard meters per word or phase could be fine tuned
      }
      if (completion.streakIncreased) {
        setStreakData({ count: completion.newStreak, isNew: true });
      }
    } catch {
      // Silent fail
    } finally {
      setCurrentStep(2);
    }
  }, [mundoId, faseOrdem, gridData]);

  if (loading) {
    return (
      <div className="min-h-dvh gradient-storm flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-[var(--color-brand)] rounded-[var(--radius-kite)] flex items-center justify-center animate-float shadow-[0_8px_0_0_var(--color-brand-shadow)]">
          <span className="text-4xl">📖</span>
        </div>
        <p className="text-white font-display font-black text-xl mt-6 uppercase tracking-wide">
          Preparando palavras cruzadas...
        </p>
      </div>
    );
  }

  if (!pilula || !gridData) {
    router.push(`/trilha/${mundoId}`);
    return null;
  }

  const isResult = currentStep === 2;

  // Lives HUD
  const livesDisplay = (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border-2 border-white/20">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`text-base sm:text-lg transition-all ${i < vidas ? "scale-100" : "scale-75 grayscale opacity-40"}`}>
            {i < vidas ? "❤️" : "🖤"}
          </span>
        ))}
      </div>
      <button 
        onClick={() => setShowSettings(true)}
        className="bg-black/30 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/20 hover:bg-black/50 transition-all opacity-80 hover:opacity-100 shrink-0"
        title="Configurações"
      >
        <Settings className="w-5 h-5" />
      </button>
      <SettingsHubModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );

  // Back button
  const backButton = (
    <button
      onClick={() => router.push(`/trilha/${mundoId}`)}
      aria-label="Voltar para a Trilha"
      title="Voltar"
      className="fixed top-4 left-4 z-50 bg-black/30 backdrop-blur-md text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-2 border-white/20 hover:bg-black/50 transition-all"
    >
      ←
    </button>
  );

  return (
    <DynamicSkyBackground mundoId={mundoId}>
      {backButton}
      {!isResult && livesDisplay}

      <div className="w-full h-full min-h-dvh flex flex-col justify-center items-center px-4 pt-20 pb-20">
        {currentStep === 0 && pilula && (
          <PillCard
            titulo={pilula.titulo}
            conteudo={pilula.conteudo}
            faseOrdem={faseOrdem}
            mundoNome={`Céu ${mundoId}`}
            onContinue={handlePillContinue}
            vidas={vidas}
            nextRechargeSeconds={nextRechargeSeconds}
            onRecharge={() => {
              getCrosswordData(mundoId, faseOrdem).then(data => {
                setVidas(data.vidas);
                setNextRechargeSeconds(data.nextRechargeSeconds || 0);
              });
            }}
          />
        )}

        {currentStep === 1 && gridData && (
          <div className="w-full max-w-md">
            <CrosswordBoard
              gridData={gridData}
              onComplete={handleCrosswordComplete}
            />
          </div>
        )}

        {isResult && (
          <ArenaResult
            score={gridData.palavras.length}
            totalQuestions={gridData.palavras.length}
            metrosGanhos={metrosGanhos}
            vidasRestantes={vidas}
            mundoId={mundoId}
            faseOrdem={faseOrdem}
            mundoConcluido={mundoConcluido}
          />
        )}
      </div>

      {streakData && (
        <StreakCelebration
          streakCount={streakData.count}
          isNew={streakData.isNew}
          onClose={() => setStreakData(null)}
        />
      )}
    </DynamicSkyBackground>
  );
}
