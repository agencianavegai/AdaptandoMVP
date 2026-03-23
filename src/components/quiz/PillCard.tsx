"use client";

import HeartRechargeTimer from "@/components/gamification/HeartRechargeTimer";

interface PillCardProps {
  titulo: string;
  conteudo: string;
  faseOrdem: number;
  mundoNome: string;
  onContinue: () => void;
  vidas?: number;
  nextRechargeSeconds?: number;
  onRecharge?: () => void;
}

export default function PillCard({ titulo, conteudo, faseOrdem, mundoNome, onContinue, vidas, nextRechargeSeconds, onRecharge }: PillCardProps) {
  // Simple markdown-like rendering: split by double newline for paragraphs
  const paragraphs = conteudo.split(/\n\n+/).filter(Boolean);

  return (
    <div className="animate-slide-up flex flex-col min-h-[60dvh]">
      {/* Header Badge */}
      <div className="text-center mb-6">
        <span className="text-xs font-black text-white/70 uppercase tracking-widest bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
          📖 Fase {faseOrdem} — {mundoNome}
        </span>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl flex-1 flex flex-col">
        <h2 className="font-display font-black text-xl sm:text-2xl text-gray-900 mb-6 leading-tight">
          {titulo}
        </h2>

        <div className="flex-1 space-y-4 text-gray-700 leading-relaxed text-base">
          {paragraphs.map((p, i) => {
            // Bold text: **text**
            const parts = p.split(/\*\*(.*?)\*\*/g);
            return (
              <p key={i}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="text-gray-900 font-bold">{part}</strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </p>
            );
          })}
        </div>

        {/* CTA Button or Timer */}
        {vidas !== undefined && vidas <= 0 ? (
          <div className="mt-8">
            <HeartRechargeTimer
              nextRechargeSeconds={nextRechargeSeconds || 0}
              currentVidas={vidas}
              onRecharge={onRecharge}
            />
          </div>
        ) : (
          <button
            onClick={onContinue}
            className="mt-8 w-full btn-3d-brand py-5 text-lg font-display font-black uppercase tracking-wider flex items-center justify-center gap-3"
          >
            <span>Desenrolar Linha</span>
            <span className="text-2xl">🪁</span>
          </button>
        )}
      </div>
    </div>
  );
}
