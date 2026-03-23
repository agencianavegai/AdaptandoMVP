"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  theme: string;
  description: string;
}

export default function StoryModal({ isOpen, onClose, title, theme, description }: StoryModalProps) {
  // Use a tiny delay to trigger the CSS transition for scale-up
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowContent(true), 10);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Decorative magical particles in the background of the modal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-[var(--color-brand)] rounded-full blur-[80px] opacity-30 animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[10%] w-40 h-40 bg-purple-500 rounded-full blur-[100px] opacity-30 animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div 
        className={`w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/50 rounded-[32px] p-8 shadow-2xl relative overflow-hidden transition-all duration-500 transform ${showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
      >
        {/* Magic top glow line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[var(--color-brand)] to-transparent opacity-80" />

        <div className="flex flex-col items-center text-center relative z-10">
          
          {/* Icon */}
          <div className="w-16 h-16 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-center justify-center mb-6 shadow-inner relative">
             <div className="absolute inset-0 bg-[var(--color-brand)] opacity-20 blur-xl rounded-full" />
             <Sparkles className="w-8 h-8 text-[var(--color-brand)] animate-pulse" />
          </div>

          {/* Titles */}
          <h3 className="text-[var(--color-brand)] font-display font-black text-sm uppercase tracking-[0.2em] mb-2 drop-shadow-sm">
            {title}
          </h3>
          <h2 className="text-white font-display font-black text-3xl mb-6 leading-tight drop-shadow-md">
            {theme}
          </h2>

          {/* Lore Text */}
          <div className="relative mb-8">
            <p className="text-slate-300 text-base leading-relaxed font-medium">
              {description}
            </p>
          </div>

          {/* Action Button */}
          <button 
            onClick={onClose}
            className="w-full relative group"
          >
            {/* The 3D Button element */}
            <div className="absolute inset-0 bg-[var(--color-brand-shadow)] rounded-2xl transform translate-y-1.5 transition-transform group-active:translate-y-0" />
            <div className="relative bg-gradient-to-b from-orange-400 to-[var(--color-brand)] border-2 border-[var(--color-brand-light)] rounded-2xl py-4 flex items-center justify-center transform transition-transform group-active:translate-y-1.5 shadow-lg">
              <span className="text-white font-display font-black text-lg uppercase tracking-wider drop-shadow-md flex items-center gap-2">
                Aceitar Missão <Sparkles className="w-5 h-5 opacity-80" />
              </span>
            </div>
          </button>
          
        </div>
      </div>
    </div>
  );
}
