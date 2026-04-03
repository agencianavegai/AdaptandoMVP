"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ArrowRight, ArrowDown, X } from "lucide-react";
import { CrosswordGrid, ClueCell } from "@/lib/actions/crossword";
import { useCrosswordGame } from "@/hooks/useCrosswordGame";
import { useGameSound } from "@/hooks/useGameSound";

interface CrosswordBoardProps {
  gridData: CrosswordGrid;
  onComplete?: () => void;
}

export function CrosswordBoard({ gridData, onComplete }: CrosswordBoardProps) {
  const {
    userInputs,
    inputCells,
    clueCells,
    wrongCells,
    shakeCells,
    isAllFilled,
    isVictory,
    handleCellInput,
    clearCell,
    verifyAll,
  } = useCrosswordGame(gridData);

  const { playCrosswordType, playCrosswordWordCorrect, playCrosswordWordWrong } = useGameSound();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [expandedClue, setExpandedClue] = useState<ClueCell | null>(null);
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);

  useEffect(() => {
    if (isVictory && onComplete) {
      playCrosswordWordCorrect?.();
      setTimeout(() => onComplete(), 1500);
    }
  }, [isVictory, onComplete, playCrosswordWordCorrect]);

  const onVerifyClick = () => {
    const correct = verifyAll();
    if (!correct) playCrosswordWordWrong?.();
  };

  const focusCell = (x: number, y: number) => {
    const el = inputRefs.current[`${x},${y}`];
    if (el) el.focus();
  };

  const handleClueClick = useCallback((clue: ClueCell) => {
    if (expandedClue && expandedClue.x === clue.x && expandedClue.y === clue.y) {
      setExpandedClue(null);
      setHighlightedWord(null);
    } else {
      setExpandedClue(clue);
      setHighlightedWord(clue.wordId || (clue as any).word || null);
    }
  }, [expandedClue]);

  const closeClue = useCallback(() => {
    setExpandedClue(null);
    setHighlightedWord(null);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, x: number, y: number) => {
    if (isVictory) return;
    if (e.key === "Backspace" && !userInputs[`${x},${y}`]) {
      e.preventDefault();
      // Try left first, then up
      if (inputCells.find(c => c.x === x - 1 && c.y === y)) {
        clearCell(x - 1, y);
        focusCell(x - 1, y);
      } else if (inputCells.find(c => c.x === x && c.y === y - 1)) {
        clearCell(x, y - 1);
        focusCell(x, y - 1);
      }
    } else if (e.key === "ArrowRight") { e.preventDefault(); focusCell(x + 1, y); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); focusCell(x - 1, y); }
    else if (e.key === "ArrowUp") { e.preventDefault(); focusCell(x, y - 1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); focusCell(x, y + 1); }
  };

  // Calculate cell size to fit screen
  const cellSize = `min(calc((100vw - 24px) / ${gridData.largura}), 42px)`;

  return (
    <div className="relative w-full flex flex-col items-center pb-24">
      {/* ─── Expanded Clue Toast ─── */}
      {expandedClue && (
        <div className="fixed top-16 left-3 right-3 z-50 animate-slide-down">
          <div className="bg-[#FFDE59] rounded-2xl p-4 shadow-xl border-2 border-amber-600/30 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {expandedClue.arrow === "right" || expandedClue.arrow === "down-right"
                ? <ArrowRight size={20} className="text-amber-800" strokeWidth={3} />
                : <ArrowDown size={20} className="text-amber-800" strokeWidth={3} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-amber-900 font-bold text-sm leading-snug">
                {expandedClue.text}
              </p>
              <p className="text-amber-700/70 text-xs mt-1 font-semibold uppercase tracking-wide">
                {expandedClue.arrow === "right" || expandedClue.arrow === "down-right" ? "→ Horizontal" : "↓ Vertical"}
                {" · "}
                {(expandedClue as any).word?.length || "?"} letras
              </p>
            </div>
            <button
              onClick={closeClue}
              className="flex-shrink-0 text-amber-800/60 hover:text-amber-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Grid ─── */}
      <div
        className="bg-[#1a1a1a] p-[2px] rounded-lg shadow-2xl select-none"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridData.largura}, ${cellSize})`,
          gridTemplateRows: `repeat(${gridData.altura}, ${cellSize})`,
          gap: "1px",
        }}
      >
        {Array.from({ length: gridData.altura }).map((_, y) =>
          Array.from({ length: gridData.largura }).map((_, x) => {
            const key = `${x},${y}`;
            const inputMatch = inputCells.find(c => c.x === x && c.y === y);
            const clueMatch = clueCells.find(c => c.x === x && c.y === y);

            /* ── Input Cell (white) ── */
            if (inputMatch) {
              const isShaking = shakeCells.some(c => c.x === x && c.y === y);
              const isWrong = wrongCells.some(c => c.x === x && c.y === y);
              const val = userInputs[key] || "";
              const isHighlighted = highlightedWord && inputMatch.wordIds.includes(highlightedWord);

              return (
                <div
                  key={`in-${key}`}
                  className={`
                    relative flex items-center justify-center bg-white
                    ${isShaking ? "animate-shake !bg-red-100" : ""}
                    ${isWrong ? "!bg-red-50" : ""}
                    ${isVictory ? "!bg-emerald-50" : ""}
                    ${isHighlighted ? "crossword-highlight" : ""}
                    focus-within:ring-2 focus-within:ring-[#FFDE59] focus-within:z-10
                  `}
                  onClick={() => { closeClue(); focusCell(x, y); }}
                >
                  <input
                    ref={(el) => { inputRefs.current[key] = el; }}
                    className={`
                      w-full h-full text-center bg-transparent outline-none uppercase p-0 m-0
                      font-black text-[clamp(14px,4vw,22px)] cursor-text
                      disabled:opacity-100 placeholder:text-transparent
                      ${isWrong ? "text-red-500" : isVictory ? "text-emerald-700" : "text-slate-900"}
                    `}
                    maxLength={1}
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={val}
                    disabled={isVictory}
                    onChange={(e) => {
                      const char = e.target.value.slice(-1);
                      if (char.match(/[a-zA-Z]/)) {
                        handleCellInput(x, y, char.toUpperCase());
                        playCrosswordType?.();
                        // Auto-advance: right first, then down
                        if (inputCells.find(c => c.x === x + 1 && c.y === y)) {
                          focusCell(x + 1, y);
                        } else if (inputCells.find(c => c.x === x && c.y === y + 1)) {
                          focusCell(x, y + 1);
                        }
                      } else {
                        clearCell(x, y);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, x, y)}
                  />
                </div>
              );
            }

            /* ── Clue Cell (yellow Coquetel) ── */
            if (clueMatch) {
              const isExpanded = expandedClue?.x === x && expandedClue?.y === y;
              return (
                <button
                  key={`cl-${key}`}
                  onClick={() => handleClueClick(clueMatch)}
                  className={`
                    relative flex flex-col items-start justify-between p-[3px] overflow-hidden
                    cursor-pointer transition-all duration-200 active:scale-95
                    ${isExpanded
                      ? "bg-[#FFD000] ring-2 ring-amber-600 z-10"
                      : "bg-[#FFDE59] hover:bg-[#FFD000]"
                    }
                  `}
                >
                  <span className="text-[7px] leading-[8px] font-bold text-amber-900/80 tracking-tight uppercase line-clamp-4 text-left w-full">
                    {(clueMatch as any).dica_curta || clueMatch.text?.slice(0, 20)}
                  </span>
                  <div className="absolute bottom-[1px] right-[2px] text-amber-800/70">
                    {(clueMatch.arrow === "right" || clueMatch.arrow === "down-right" || clueMatch.arrow === "corner-split")
                      ? <ArrowRight size={10} strokeWidth={3} />
                      : <ArrowDown size={10} strokeWidth={3} />
                    }
                  </div>
                </button>
              );
            }

            /* ── Empty (should not exist in Coquetel) ── */
            return <div key={`em-${key}`} className="bg-[#1a1a1a]" />;
          })
        )}
      </div>

      {/* ─── Floating Verify Button ─── */}
      {!isVictory && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
          <button
            onClick={onVerifyClick}
            disabled={!isAllFilled}
            className={`
              pointer-events-auto flex items-center justify-center px-8 py-3.5 rounded-full font-black text-lg
              transition-all duration-300 transform
              ${isAllFilled
                ? "bg-[var(--color-brand)] text-white shadow-[0_4px_0_0_var(--color-brand-shadow)] translate-y-0 opacity-100 hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-brand-shadow)]"
                : "bg-slate-200 text-slate-400 shadow-none translate-y-8 opacity-0 pointer-events-none"
              }
            `}
          >
            ✓ Verificar Tudo
          </button>
        </div>
      )}
    </div>
  );
}
