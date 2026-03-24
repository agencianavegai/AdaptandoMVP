"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

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
  onAnswer: (selectedIdx: number, acertou: boolean) => void;
}

export default function QuizQuestion({
  pergunta,
  alternativas,
  explicacao,
  questionNumber,
  totalQuestions,
  onAnswer,
}: QuizQuestionProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const correctIdx = alternativas.findIndex((a) => a.correta);
  const acertou = selectedIdx === correctIdx;

  function handleSelect(idx: number) {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);

    // Auto-advance after feedback delay
    setTimeout(() => {
      onAnswer(idx, idx === correctIdx);
    }, 2500);
  }

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
            }

            return (
              <button
                key={idx}
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
          </div>
        )}
      </div>
    </div>
  );
}
