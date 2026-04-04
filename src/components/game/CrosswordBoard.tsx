"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { ArrowRight, ArrowDown, X } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { CrosswordGrid, ClueCell, InputCell } from "@/lib/actions/crossword";
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
  const [activeDirection, setActiveDirection] = useState<"horizontal" | "vertical" | null>(null);

  // ─── Build a fast lookup set for occupied cells ───
  const occupiedCells = useMemo(() => {
    const set = new Set<string>();
    for (const c of gridData.cells) {
      set.add(`${c.x},${c.y}`);
    }
    return set;
  }, [gridData.cells]);

  // ─── Build word-direction map for smart focus ───
  const cellDirections = useMemo(() => {
    const map: Record<string, { horizontal: boolean; vertical: boolean }> = {};
    for (const cell of inputCells) {
      const key = `${cell.x},${cell.y}`;
      map[key] = { horizontal: false, vertical: false };
    }
    // Each clue has an arrow (right = horizontal, down = vertical) and a word
    // Input cells belong to words via wordIds
    // We need to figure out which directions each cell participates in
    for (const clue of clueCells) {
      const word = (clue as any).word as string | undefined;
      if (!word) continue;
      const isHorizontal = clue.arrow === "right" || clue.arrow === "down-right" || clue.arrow === "corner-split";
      for (const cell of inputCells) {
        if (cell.wordIds.includes(word)) {
          const key = `${cell.x},${cell.y}`;
          if (map[key]) {
            if (isHorizontal) map[key].horizontal = true;
            else map[key].vertical = true;
          }
        }
      }
    }
    return map;
  }, [inputCells, clueCells]);

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
      setHighlightedWord((clue as any).word || clue.wordId || null);

      // Set active direction based on clue arrow
      const isH = clue.arrow === "right" || clue.arrow === "down-right" || clue.arrow === "corner-split";
      setActiveDirection(isH ? "horizontal" : "vertical");

      // Focus the first input cell of this word
      const word = (clue as any).word as string | undefined;
      if (word) {
        const firstCell = inputCells.find(c => c.wordIds.includes(word));
        if (firstCell) {
          setTimeout(() => focusCell(firstCell.x, firstCell.y), 100);
        }
      }
    }
  }, [expandedClue, inputCells]);

  const closeClue = useCallback(() => {
    setExpandedClue(null);
    setHighlightedWord(null);
  }, []);

  // ─── Smart Auto-Directional Focus ───
  // Detects direction based on which word the cell belongs to and context
  const getNextCell = useCallback((x: number, y: number, direction: "horizontal" | "vertical" | null): { x: number; y: number } | null => {
    if (direction === "horizontal") {
      // Move right
      const next = inputCells.find(c => c.x === x + 1 && c.y === y);
      if (next) return { x: next.x, y: next.y };
    } else if (direction === "vertical") {
      // Move down
      const next = inputCells.find(c => c.x === x && c.y === y + 1);
      if (next) return { x: next.x, y: next.y };
    }
    
    // Fallback: try right, then down
    const right = inputCells.find(c => c.x === x + 1 && c.y === y);
    if (right) return { x: right.x, y: right.y };
    const down = inputCells.find(c => c.x === x && c.y === y + 1);
    if (down) return { x: down.x, y: down.y };
    return null;
  }, [inputCells]);

  const getPrevCell = useCallback((x: number, y: number, direction: "horizontal" | "vertical" | null): { x: number; y: number } | null => {
    if (direction === "horizontal") {
      const prev = inputCells.find(c => c.x === x - 1 && c.y === y);
      if (prev) return { x: prev.x, y: prev.y };
    } else if (direction === "vertical") {
      const prev = inputCells.find(c => c.x === x && c.y === y - 1);
      if (prev) return { x: prev.x, y: prev.y };
    }
    const left = inputCells.find(c => c.x === x - 1 && c.y === y);
    if (left) return { x: left.x, y: left.y };
    const up = inputCells.find(c => c.x === x && c.y === y - 1);
    if (up) return { x: up.x, y: up.y };
    return null;
  }, [inputCells]);

  // When a cell is clicked, detect its direction
  const handleCellClick = useCallback((x: number, y: number) => {
    closeClue();
    const key = `${x},${y}`;
    const dirs = cellDirections[key];
    if (dirs) {
      // Toggle direction if cell participates in both
      if (dirs.horizontal && dirs.vertical) {
        setActiveDirection(prev => prev === "horizontal" ? "vertical" : "horizontal");
      } else if (dirs.horizontal) {
        setActiveDirection("horizontal");
      } else if (dirs.vertical) {
        setActiveDirection("vertical");
      }
    }
    focusCell(x, y);
  }, [cellDirections, closeClue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, x: number, y: number) => {
    if (isVictory) return;
    if (e.key === "Backspace" && !userInputs[`${x},${y}`]) {
      e.preventDefault();
      const prev = getPrevCell(x, y, activeDirection);
      if (prev) {
        clearCell(prev.x, prev.y);
        focusCell(prev.x, prev.y);
      }
    } else if (e.key === "ArrowRight") { e.preventDefault(); focusCell(x + 1, y); setActiveDirection("horizontal"); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); focusCell(x - 1, y); setActiveDirection("horizontal"); }
    else if (e.key === "ArrowUp") { e.preventDefault(); focusCell(x, y - 1); setActiveDirection("vertical"); }
    else if (e.key === "ArrowDown") { e.preventDefault(); focusCell(x, y + 1); setActiveDirection("vertical"); }
  };

  // Calculate cell size to fit screen — for larger grids, cells are smaller
  const cellSize = `min(calc((100vw - 32px) / ${gridData.largura}), 40px)`;

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

      {/* ─── Grid with Pinch-to-Zoom ─── */}
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        centerOnInit
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", maxWidth: "100vw", touchAction: "none" }}
          contentStyle={{ width: "fit-content", margin: "0 auto" }}
        >
          <div
            className="p-[2px] rounded-lg select-none"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridData.largura}, ${cellSize})`,
              gridTemplateRows: `repeat(${gridData.altura}, ${cellSize})`,
              gap: "1px",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            {Array.from({ length: gridData.altura }).map((_, y) =>
              Array.from({ length: gridData.largura }).map((_, x) => {
                const key = `${x},${y}`;
                const isOccupied = occupiedCells.has(key);
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
                      onClick={() => handleCellClick(x, y)}
                    >
                      <input
                        ref={(el) => { inputRefs.current[key] = el; }}
                        className={`
                          w-full h-full text-center bg-transparent outline-none uppercase p-0 m-0
                          font-black text-[clamp(12px,3.5vw,20px)] cursor-text
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
                            // Smart auto-advance based on active direction
                            const next = getNextCell(x, y, activeDirection);
                            if (next) focusCell(next.x, next.y);
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
                        relative flex flex-col items-start justify-between p-[2px] overflow-hidden
                        cursor-pointer transition-all duration-200 active:scale-95
                        ${isExpanded
                          ? "bg-[#FFD000] ring-2 ring-amber-600 z-10"
                          : "bg-[#FFDE59] hover:bg-[#FFD000]"
                        }
                      `}
                    >
                      <span className="text-[6px] leading-[7px] font-bold text-amber-900/80 tracking-tight uppercase line-clamp-4 text-left w-full">
                        {clueMatch.dica_curta || clueMatch.text?.slice(0, 18)}
                      </span>
                      <div className="absolute bottom-[1px] right-[1px] text-amber-800/70">
                        {(clueMatch.arrow === "right" || clueMatch.arrow === "down-right" || clueMatch.arrow === "corner-split")
                          ? <ArrowRight size={8} strokeWidth={3} />
                          : <ArrowDown size={8} strokeWidth={3} />
                        }
                      </div>
                    </button>
                  );
                }

                /* ── Empty cell → transparent (not black!) ── */
                return <div key={`em-${key}`} className="bg-transparent" />;
              })
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>

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
