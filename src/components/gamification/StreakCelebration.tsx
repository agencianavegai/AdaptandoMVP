"use client";

import { useState, useEffect, useCallback } from "react";
import { Flame, X } from "lucide-react";

interface StreakCelebrationProps {
  streakCount: number;
  isNew: boolean;
  onClose: () => void;
}

export default function StreakCelebration({ streakCount, isNew, onClose }: StreakCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isNew && streakCount > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isNew, streakCount]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white rounded-[32px] p-8 shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full animate-pop-in">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={3} />
        </button>

        {/* Fire Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-warning)] to-orange-500 rounded-full flex items-center justify-center shadow-[0_8px_0_0_var(--color-warning-shadow)] animate-float">
          <Flame className="w-10 h-10 text-white" fill="white" strokeWidth={2} />
        </div>

        {/* Counter */}
        <div className="text-center">
          <h2 className="font-display font-black text-4xl text-[var(--color-warning)]">
            {streakCount} {streakCount === 1 ? "dia" : "dias"}
          </h2>
          <p className="font-display font-bold text-lg text-[var(--color-text-primary)] mt-1 uppercase tracking-wide">
            de Ofensiva! 🔥
          </p>
        </div>

        <p className="text-[var(--color-text-secondary)] text-sm text-center font-medium">
          Seu vento soprou mais forte! Continue assim para não perder a sequência.
        </p>
      </div>
    </div>
  );
}
