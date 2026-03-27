"use client";

import { useState } from "react";
import { Info, X, Heart, Instagram } from "lucide-react";

export default function AboutModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* TRIGGER BUTTON (Floating Bottom Right) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/30 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 active:scale-95 transition-all duration-300 animate-float group"
        aria-label="Sobre o Adaptdando"
        title="O que é isso?"
      >
        <Info className="w-6 h-6 opacity-80 group-hover:opacity-100" />
      </button>

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          {/* MODAL CONTAINER */}
          <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-orange-400 to-amber-500 rounded-[32px] shadow-2xl flex flex-col relative overflow-hidden animate-slide-up">
            
            {/* Soft background decor */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 z-20 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-white hover:bg-black/20 transition-colors backdrop-blur-md cursor-pointer outline-none"
            >
              <X strokeWidth={3} className="w-4 h-4" />
            </button>

            {/* CONTENT */}
            <div className="pt-10 pb-8 px-6 sm:px-8 relative z-10 flex flex-col items-center text-center">
              
              {/* Épic Title */}
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/30 rotate-3">
                <span className="text-3xl">🪁</span>
              </div>
              
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide drop-shadow-md mb-4 leading-tight">
                O que é o<br/>Adaptdando?
              </h2>

              <p className="text-white/95 font-medium text-base sm:text-lg leading-relaxed mb-6">
                O <strong>Adaptdando</strong> é uma plataforma gamificada para capacitar voluntários e líderes sociais. Uma jornada por 10 Mundos para dominar desde o básico do voluntariado até a gestão completa de uma ONG.
              </p>

              {/* Credits */}
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 w-full mb-6 flex flex-col items-center justify-center gap-2">
                <span className="text-white/80 font-bold text-sm uppercase tracking-wider">Criado com <Heart className="inline w-3 h-3 text-red-500 fill-red-500 mx-0.5" /> pelo</span>
                <span className="text-white font-black text-xl tracking-wide">Instituto Ádapo</span>
              </div>

              {/* CTA Instagram */}
              <a
                href="https://instagram.com/instituto.adapo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white text-orange-500 font-display font-black text-lg sm:text-xl tracking-wide uppercase rounded-2xl py-4 border-b-[6px] border-b-orange-200 hover:bg-slate-50 hover:border-b-orange-100 hover:translate-y-[2px] active:border-b-0 active:translate-y-[6px] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                Siga nosso voo
              </a>

              {/* Dismiss Link */}
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-6 text-white/80 font-bold text-sm hover:text-white underline decoration-2 underline-offset-4 transition-colors"
              >
                Entendi, bora jogar!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
