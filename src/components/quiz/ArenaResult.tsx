"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameSound } from "@/hooks/useGameSound";

interface ArenaResultProps {
  score: number;
  totalQuestions: number;
  metrosGanhos: number;
  vidasRestantes: number;
  mundoId: number;
  faseOrdem: number;
  mundoConcluido: boolean;
}

export default function ArenaResult({
  score,
  totalQuestions,
  metrosGanhos,
  vidasRestantes,
  mundoId,
  faseOrdem,
  mundoConcluido,
}: ArenaResultProps) {
  const router = useRouter();
  const passed = score >= 3; // At least 3/5 to pass
  const perfect = score === totalQuestions;
  const gameOver = vidasRestantes <= 0;

  const { playPhaseComplete, playClick, playHover } = useGameSound();

  useEffect(() => {
    if (passed && !gameOver) {
      playPhaseComplete();
    }
  }, [passed, gameOver, playPhaseComplete]);

  function handleBack() {
    playClick();
    if (gameOver) {
      router.push("/mapa");
    } else {
      router.push(`/trilha/${mundoId}`);
    }
  }

  return (
    <div className="animate-slide-up flex flex-col items-center text-center">
      {/* Emoji Hero */}
      <div className="text-8xl mb-6 animate-float">
        {gameOver ? "💥" : mundoConcluido ? "🏆" : perfect ? "⭐" : passed ? "🪁" : "🌧️"}
      </div>

      {/* Result Card */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm">
        <h2 className="font-display font-black text-2xl text-gray-900 mb-2">
          {gameOver
            ? "Pipa Caiu!"
            : mundoConcluido
            ? "Céu Desbloqueado!"
            : perfect
            ? "Perfeito!"
            : passed
            ? "Fase Completa!"
            : "Quase lá..."}
        </h2>

        <p className="text-gray-500 font-medium mb-6">
          {gameOver
            ? "Seus papéis de seda acabaram. Espere para empinar de novo!"
            : mundoConcluido
            ? "Você concluiu todas as 6 fases deste mundo!"
            : `Fase ${faseOrdem} concluída`}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-orange-50 rounded-2xl p-3">
            <p className="text-2xl font-black text-[var(--color-brand)]">{score}/{totalQuestions}</p>
            <p className="text-xs font-bold text-gray-500 uppercase">Acertos</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-3">
            <p className="text-2xl font-black text-blue-600">+{metrosGanhos}m</p>
            <p className="text-xs font-bold text-gray-500 uppercase">Linha</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-3">
            <p className="text-2xl font-black text-red-500">
              {"❤️".repeat(Math.max(vidasRestantes, 0))}
              {"🖤".repeat(Math.max(5 - vidasRestantes, 0))}
            </p>
            <p className="text-xs font-bold text-gray-500 uppercase">Vidas</p>
          </div>
        </div>

        {/* Bonus for world completion */}
        {mundoConcluido && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6 animate-pulse-glow">
            <p className="font-black text-amber-700 text-lg">🎁 Bônus +50 Metros!</p>
            <p className="text-amber-600 text-sm font-medium">Por completar todas as fases do Céu</p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleBack}
          onMouseEnter={playHover}
          className="w-full btn-3d-brand py-4 text-lg font-display font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {gameOver ? "Voltar ao Mapa" : mundoConcluido ? "Próximo Céu!" : "Ver Trilha"}
        </button>
      </div>
    </div>
  );
}
