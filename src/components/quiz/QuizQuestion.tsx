"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2, ArrowRight } from "lucide-react";
import { useGameSound } from "@/hooks/useGameSound";

interface Alternativa {
  texto: string;
  correta: boolean;
}

interface QuizQuestionProps {
  pergunta: string;
  alternativas: Alternativa[];
  explicacao: string | null;
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (selectedIdx: number, acertou: boolean) => Promise<void>;
  onNext: () => void;
}

export default function QuizQuestion({
  pergunta,
  alternativas,
  explicacao,
  questionNumber,
  totalQuestions,
  onSubmit,
  onNext,
}: QuizQuestionProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answered, setAnswered] = useState(false);

  const correctIdx = alternativas.findIndex((a) => a.correta);
  const acertou = selectedIdx === correctIdx;

  const { playHover, playClick, playQuizCorrect, playQuizWrong } = useGameSound();

  function handleSelect(idx: number) {
    if (answered || isSubmitting) return;
    setSelectedIdx(idx);
  }

  async function handleConfirm() {
    if (selectedIdx === null || answered || isSubmitting) return;
    setIsSubmitting(true);
    const isCorrectAnswer = selectedIdx === correctIdx;

    await onSubmit(selectedIdx, isCorrectAnswer);
    setAnswered(true);
    setIsSubmitting(false);
  }

  useEffect(() => {
    let timeoutId: any;

    if (answered && !isSubmitting) {
      if (acertou) {
        timeoutId = setTimeout(() => {
          playQuizCorrect();
        }, 50);
      } else {
        timeoutId = setTimeout(() => {
          playQuizWrong();
        }, 50);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [answered, isSubmitting, acertou, playQuizCorrect, playQuizWrong]);

  return (
    <div className="animate-slide-up flex flex-col">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-black text-white/70 uppercase tracking-wider">
            Pergunta {questionNumber}/{totalQuestions}
          </span>
          <span className="text-xs font-bold text-white/50">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-[var(--color-brand)] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h3 className="font-display font-black text-xl sm:text-2xl text-gray-900 mb-8 leading-snug">
          {pergunta}
        </h3>

        {/* Alternativas */}
        <div className="space-y-3">
          {alternativas.map((alt, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrect = alt.correta;

            let buttonStyle = "bg-gray-50 border-gray-200 shadow-[0_4px_0_0_#e5e5e5] text-gray-800 hover:bg-gray-100 active:shadow-none active:translate-y-1";

            if (answered) {
              if (isCorrect) {
                buttonStyle = "bg-emerald-100 border-emerald-500 shadow-[0_4px_0_0_#059669] text-emerald-800 scale-[1.02]";
              } else if (isSelected && !isCorrect) {
                buttonStyle = "bg-red-100 border-red-500 shadow-[0_4px_0_0_#dc2626] text-red-800 animate-shake";
              } else {
                buttonStyle = "bg-gray-50 border-gray-200 shadow-[0_4px_0_0_#e5e5e5] text-gray-400 opacity-60";
              }
            } else if (isSelected) {
              buttonStyle = "bg-blue-50 border-blue-400 shadow-[0_4px_0_0_#60a5fa] text-blue-900 scale-[1.02] ring-2 ring-blue-200";
            }

            return (
              <button
                key={idx}
                onMouseEnter={playHover}
                onClick={() => handleSelect(idx)}
                disabled={answered}
                className={cn(
                  "w-full text-left px-5 py-4 rounded-2xl border-2 font-bold text-[17px] transition-all duration-200",
                  buttonStyle
                )}
              >
                <span className="font-black text-sm mr-3 opacity-50">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {alt.texto}
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        {!answered && (
          <div className="mt-8 animate-slide-up">
            <button
              onMouseEnter={playHover}
              onClick={() => { playClick(); handleConfirm(); }}
              disabled={selectedIdx === null || isSubmitting}
              className="w-full btn-3d-brand py-4 font-display font-black uppercase text-lg tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-[var(--color-brand)] disabled:active:translate-y-0 disabled:active:border-b-[4px]"
            >
              {isSubmitting ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Verificando...</>
              ) : (
                "Confirmar Resposta"
              )}
            </button>
          </div>
        )}

        {/* Inline Feedback */}
        {answered && (
          <div
            className={cn(
              "mt-6 p-5 rounded-2xl animate-slide-up",
              acertou
                ? "bg-emerald-50 border-2 border-emerald-200"
                : "bg-red-50 border-2 border-red-200"
            )}
            role="status"
            aria-live="polite"
          >
            {acertou ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎉</span>
                <div>
                  <p className="font-black text-emerald-700 text-lg">Mandou bem!</p>
                  <p className="font-bold text-emerald-600 text-sm">+10 Metros de Linha</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">💔</span>
                  <div>
                    <p className="font-black text-red-700 text-lg">Quase lá!</p>
                    <p className="font-bold text-red-600 text-sm">−1 Papel de Seda</p>
                  </div>
                </div>
                {explicacao && (
                  <p className="text-red-700/80 text-sm leading-relaxed pl-12">
                    <strong>Entenda:</strong> {explicacao}
                  </p>
                )}
              </div>
            )}

            {/* Continuar Button */}
            <button
              onMouseEnter={playHover}
              onClick={() => { playClick(); onNext(); }}
              className={cn(
                "mt-6 w-full py-4 rounded-xl font-display font-black text-white uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0",
                acertou ? "bg-emerald-600 hover:bg-emerald-700 font-display" : "bg-red-600 hover:bg-red-700 font-display"
              )}
            >
              Continuar <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
