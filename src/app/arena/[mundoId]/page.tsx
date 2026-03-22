"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getArenaData, submitAnswer, completeFase } from "@/lib/actions/gamification";
import PillCard from "@/components/quiz/PillCard";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import ArenaResult from "@/components/quiz/ArenaResult";

interface Alternativa {
  texto: string;
  correta: boolean;
}

interface Quiz {
  id: string;
  pergunta: string;
  alternativas: Alternativa[];
  explicacao: string | null;
  ordem: number;
}

interface Pilula {
  id: string;
  titulo: string;
  conteudo: string;
  ordem: number;
}

export default function ArenaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const mundoId = Number(params.mundoId);
  const faseOrdem = Number(searchParams.get("fase") || "1");

  const [pilula, setPilula] = useState<Pilula | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [vidas, setVidas] = useState(5);
  const [metrosLinha, setMetrosLinha] = useState(0);
  const [loading, setLoading] = useState(true);

  // State machine: 0 = pill, 1-5 = quiz questions, 6 = result
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [metrosGanhos, setMetrosGanhos] = useState(0);
  const [mundoConcluido, setMundoConcluido] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getArenaData(mundoId, faseOrdem);
        setPilula(data.pilula);
        setQuizzes(data.quizzes);
        setVidas(data.vidas);
        setMetrosLinha(data.metrosLinha);
      } catch {
        router.push(`/trilha/${mundoId}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mundoId, faseOrdem]);

  const handlePillContinue = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleAnswer = useCallback(async (selectedIdx: number, acertou: boolean) => {
    const quiz = quizzes[currentStep - 1];
    if (!quiz) return;

    try {
      const result = await submitAnswer(quiz.id, selectedIdx, acertou);
      setVidas(result.novasVidas);
      setMetrosLinha(result.novosMetros);

      if (acertou) {
        setScore((prev) => prev + 1);
        setMetrosGanhos((prev) => prev + 10);
      }

      // Game Over check
      if (result.novasVidas <= 0) {
        setCurrentStep(quizzes.length + 1); // Jump to result
        return;
      }

      // If more questions, advance; otherwise complete
      if (currentStep < quizzes.length) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // All questions answered — complete the phase
        const completion = await completeFase(mundoId, faseOrdem, score + (acertou ? 1 : 0));
        setMundoConcluido(completion.mundoConcluido);
        if (completion.mundoConcluido) {
          setMetrosGanhos((prev) => prev + 50);
        }
        setCurrentStep(quizzes.length + 1);
      }
    } catch {
      // Silent fail — optimistic UI already updated
    }
  }, [quizzes, currentStep, mundoId, faseOrdem, score]);

  if (loading) {
    return (
      <div className="min-h-dvh gradient-storm flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-[var(--color-brand)] rounded-[var(--radius-kite)] flex items-center justify-center animate-float shadow-[0_8px_0_0_var(--color-brand-shadow)]">
          <span className="text-4xl">📖</span>
        </div>
        <p className="text-white font-display font-black text-xl mt-6 uppercase tracking-wide">
          Abrindo a pílula...
        </p>
      </div>
    );
  }

  if (!pilula || quizzes.length === 0) {
    router.push(`/trilha/${mundoId}`);
    return null;
  }

  // Lives HUD
  const livesDisplay = (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white/20">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`text-lg transition-all ${i < vidas ? "scale-100" : "scale-75 grayscale opacity-40"}`}>
          {i < vidas ? "❤️" : "🖤"}
        </span>
      ))}
    </div>
  );

  // Back button
  const backButton = (
    <button
      onClick={() => router.push(`/trilha/${mundoId}`)}
      className="fixed top-4 left-4 z-50 bg-black/30 backdrop-blur-md text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-2 border-white/20 hover:bg-black/50 transition-all"
    >
      ←
    </button>
  );

  const TOTAL_QUESTIONS = quizzes.length;
  const isResult = currentStep > TOTAL_QUESTIONS;

  return (
    <div className="min-h-dvh map-scroll-bg bg-fixed">
      {backButton}
      {!isResult && livesDisplay}

      <div className="max-w-lg mx-auto px-4 pt-20 pb-20">
        {currentStep === 0 && pilula && (
          <PillCard
            titulo={pilula.titulo}
            conteudo={pilula.conteudo}
            faseOrdem={faseOrdem}
            mundoNome={`Céu ${mundoId}`}
            onContinue={handlePillContinue}
          />
        )}

        {currentStep >= 1 && currentStep <= TOTAL_QUESTIONS && (
          <QuizQuestion
            key={quizzes[currentStep - 1].id}
            pergunta={quizzes[currentStep - 1].pergunta}
            alternativas={quizzes[currentStep - 1].alternativas}
            explicacao={quizzes[currentStep - 1].explicacao}
            questionNumber={currentStep}
            totalQuestions={TOTAL_QUESTIONS}
            onAnswer={handleAnswer}
          />
        )}

        {isResult && (
          <ArenaResult
            score={score}
            totalQuestions={TOTAL_QUESTIONS}
            metrosGanhos={metrosGanhos}
            vidasRestantes={vidas}
            mundoId={mundoId}
            faseOrdem={faseOrdem}
            mundoConcluido={mundoConcluido}
          />
        )}
      </div>
    </div>
  );
}
