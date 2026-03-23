"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface DynamicSkyBackgroundProps {
  mundoId: number;
  children: ReactNode;
  className?: string;
}

export function DynamicSkyBackground({ mundoId, children, className }: DynamicSkyBackgroundProps) {
  // Garantir que caia em um mapa válido, limite entre 1 e 10
  const normalizedId = Math.max(1, Math.min(10, mundoId));
  
  // O Next.js suporta caminhos com espaços, mas encodeURIComponent garante que funcione em todos os browsers + loader da Vercel
  const imageSrc = `/images/backgrounds/MUNDO ${normalizedId}.png`;

  return (
    <div 
      className={cn(
        "relative min-h-dvh w-full overflow-hidden bg-slate-950 transition-colors duration-1000 ease-in-out",
        className
      )}
    >
      {/* Imagem de Fundo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src={imageSrc}
          alt={`Cenário do Mundo ${normalizedId}`}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          quality={100} // Removida a limitação de qualidade agressiva para preservar os detalhes da ilustração
          unoptimized={true} // Força o Next.js a usar a imagem exata do disco
        />
        
        {/* Overlay escuro para UX/UI: garante legibilidade da roleta, cards brancos e topbar */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* Conteúdo principal renderizado acima do fundo */}
      <div className="relative z-10 w-full h-full min-h-dvh flex flex-col">
        {children}
      </div>
    </div>
  );
}
