"use client";

import useSound from "use-sound";
import { useAudio } from "@/contexts/AudioContext";
import { useCallback } from "react";

export function useGameSound() {
  const { isMuted } = useAudio();

  // Load sound sprites or individual files
  // For now, mapping individual files from public/sounds/
  const [playUiHoverSound] = useSound("/sounds/ui-hover.mp3", { volume: 0.3, interrupt: true });
  const [playUiClickSound] = useSound("/sounds/ui-click.mp3", { volume: 0.5, interrupt: true });
  const [playQuizCorrectSound] = useSound("/sounds/quiz-correct.mp3", { volume: 0.6, interrupt: true });
  const [playQuizWrongSound] = useSound("/sounds/quiz-wrong.mp3", { volume: 0.6, interrupt: true });
  const [playPhaseCompleteSound] = useSound("/sounds/phase-complete.mp3", { volume: 0.6, interrupt: true });
  const [playModalSwooshSound] = useSound("/sounds/modal-swoosh.mp3", { volume: 0.4, interrupt: true });

  const playHover = useCallback(() => {
    if (!isMuted) playUiHoverSound();
  }, [isMuted, playUiHoverSound]);

  const playClick = useCallback(() => {
    if (!isMuted) playUiClickSound();
  }, [isMuted, playUiClickSound]);

  const playQuizCorrect = useCallback(() => {
    if (!isMuted) playQuizCorrectSound();
  }, [isMuted, playQuizCorrectSound]);

  const playQuizWrong = useCallback(() => {
    if (!isMuted) playQuizWrongSound();
  }, [isMuted, playQuizWrongSound]);

  const playPhaseComplete = useCallback(() => {
    if (!isMuted) playPhaseCompleteSound();
  }, [isMuted, playPhaseCompleteSound]);

  const playModalSwoosh = useCallback(() => {
    if (!isMuted) playModalSwooshSound();
  }, [isMuted, playModalSwooshSound]);

  return {
    playHover,
    playClick,
    playQuizCorrect,
    playQuizWrong,
    playPhaseComplete,
    playModalSwoosh,
  };
}
