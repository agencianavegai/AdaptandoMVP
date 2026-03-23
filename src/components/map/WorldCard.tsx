"use client";

import Image from "next/image";
import { Lock, Check, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorldCardProps {
  mundo: {
    id: number;
    nome_tema: string;
    clima_visual: string;
    cor_fase: string;
    ordem: number;
    descricao?: string;
  };
  status: "bloqueado" | "ativo" | "concluido";
  score: number;
  onNavigate: (mundoId: number) => void;
}

export default function WorldCard({ mundo, status, score, onNavigate }: WorldCardProps) {
  const isLocked = status === "bloqueado";
  const isCompleted = status === "concluido";
  const isActive = status === "ativo";

  const imageSrc = `/images/backgrounds/MUNDO ${mundo.ordem}.png`;

  return (
    <button
      disabled={isLocked}
      onClick={() => !isLocked && onNavigate(mundo.id)}
      className={cn(
        "relative w-full rounded-3xl overflow-hidden text-left transition-all duration-300 active:scale-[0.97]",
        isLocked && "grayscale opacity-60 cursor-not-allowed",
        isActive && "ring-4 ring-[var(--color-brand)] ring-offset-2 ring-offset-[var(--color-storm-dark)]",
        !isLocked && "cursor-pointer hover:scale-[1.01]",
        // 3D border-bottom effect
        "border-b-[6px]",
        isCompleted ? "border-b-[var(--color-success-shadow)]" : isActive ? "border-b-[var(--color-brand-shadow)]" : "border-b-gray-600"
      )}
      style={{ minHeight: "180px" }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={`Cenário ${mundo.nome_tema}`}
          fill
          className="object-cover object-center"
          sizes="(max-width: 640px) 100vw, 500px"
          quality={85}
        />
        {/* Dark overlay for text readability */}
        <div className={cn(
          "absolute inset-0",
          isLocked
            ? "bg-black/60"
            : "bg-gradient-to-r from-black/70 via-black/40 to-transparent"
        )} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-5 min-h-[180px]">
        {/* Top Row: Badge + Status */}
        <div className="flex items-start justify-between">
          <span className="bg-black/40 backdrop-blur-sm text-white/90 text-[10px] font-display font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full">
            Mundo {mundo.ordem}
          </span>

          {isCompleted && (
            <div className="bg-[var(--color-success)] w-8 h-8 rounded-full flex items-center justify-center shadow-[0_3px_0_0_var(--color-success-shadow)]">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
          )}
          {isLocked && (
            <div className="bg-gray-500/60 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Lock className="w-4 h-4 text-white/70" strokeWidth={3} />
            </div>
          )}
          {isActive && (
            <div className="bg-[var(--color-brand)] w-8 h-8 rounded-full flex items-center justify-center shadow-[0_3px_0_0_var(--color-brand-shadow)] animate-pulse">
              <Play className="w-4 h-4 text-white ml-0.5" fill="white" strokeWidth={0} />
            </div>
          )}
        </div>

        {/* Middle: Title & Description */}
        <div className="mt-auto">
          <h2 className="font-display font-black text-2xl text-white uppercase leading-tight drop-shadow-md">
            {mundo.nome_tema}
          </h2>
          <p className="text-white/60 text-sm font-medium mt-1 line-clamp-1">
            {mundo.clima_visual}
          </p>
        </div>

        {/* Bottom: CTA Button */}
        <div className="mt-4">
          {isActive && (
            <div className="btn-3d-brand py-3 w-full text-center text-sm flex items-center justify-center gap-2">
              <Play className="w-4 h-4" fill="white" strokeWidth={0} />
              COMEÇAR
            </div>
          )}
          {isCompleted && (
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-[var(--radius-btn)] py-3 w-full text-center text-white font-display font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" />
              REVISAR
            </div>
          )}
          {isLocked && (
            <div className="bg-gray-600/40 backdrop-blur-sm rounded-[var(--radius-btn)] py-3 w-full text-center text-white/40 font-display font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 cursor-not-allowed">
              <Lock className="w-4 h-4" />
              BLOQUEADO
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
