"use client";

import { useState, useCallback, useMemo } from "react";
import { CrosswordGrid, InputCell, ClueCell, GridCell } from "@/lib/actions/crossword";

export interface CellData {
  x: number;
  y: number;
  letter: string;
  wordIds: string[];
}

export function useCrosswordGame(initialGrid: CrosswordGrid | null) {
  // Store user inputs as a map "x,y" => uppercase string
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  
  // Game states
  const [wrongCells, setWrongCells] = useState<{x: number, y: number}[]>([]); 
  const [shakeCells, setShakeCells] = useState<{x: number, y: number}[]>([]); 
  const [isVictory, setIsVictory] = useState(false);
  const [errorsCount, setErrorsCount] = useState(0);

  // Pre-calculate what truth letters go where
  const inputCells = useMemo(() => {
    if (!initialGrid) return [];
    return initialGrid.cells.filter(c => c.type === "input") as InputCell[];
  }, [initialGrid]);

  const clueCells = useMemo(() => {
    if (!initialGrid) return [];
    return initialGrid.cells.filter(c => c.type === "clue") as ClueCell[];
  }, [initialGrid]);

  // Is every input cell filled?
  const isAllFilled = useMemo(() => {
    if (inputCells.length === 0) return false;
    for (const cell of inputCells) {
      const key = `${cell.x},${cell.y}`;
      if (!userInputs[key] || userInputs[key].trim() === "") {
        return false;
      }
    }
    return true;
  }, [inputCells, userInputs]);

  const handleCellInput = useCallback((x: number, y: number, char: string) => {
    setUserInputs((prev) => {
      const key = `${x},${y}`;
      // Remove from wrong cells immediately if they type again
      setWrongCells(prevWrongs => prevWrongs.filter(c => c.x !== x || c.y !== y));
      return { ...prev, [key]: char.toUpperCase() };
    });
  }, []);

  const clearCell = useCallback((x: number, y: number) => {
    setUserInputs((prev) => {
      const key = `${x},${y}`;
      const next = { ...prev };
      delete next[key];
      setWrongCells(prevWrongs => prevWrongs.filter(c => c.x !== x || c.y !== y));
      return next;
    });
  }, []);

  const verifyAll = useCallback(() => {
    if (!initialGrid) return false;

    let isCorrect = true;
    const currentWrongs: {x: number, y: number}[] = [];

    for (const cell of inputCells) {
      const key = `${cell.x},${cell.y}`;
      const userChar = userInputs[key] || "";
      const truthChar = cell.answer.toUpperCase();

      if (userChar !== truthChar) {
        isCorrect = false;
        currentWrongs.push({x: cell.x, y: cell.y});
      }
    }

    if (isCorrect) {
      setIsVictory(true);
      setWrongCells([]);
      return true;
    } else {
      setErrorsCount(e => e + 1);
      setWrongCells(currentWrongs);
      setShakeCells(currentWrongs);
      setTimeout(() => setShakeCells([]), 600);
      return false;
    }
  }, [initialGrid, inputCells, userInputs]);

  return {
    userInputs,
    inputCells,
    clueCells,
    wrongCells,
    shakeCells,
    isAllFilled,
    isVictory,
    errorsCount,
    handleCellInput,
    clearCell,
    verifyAll,
  };
}
