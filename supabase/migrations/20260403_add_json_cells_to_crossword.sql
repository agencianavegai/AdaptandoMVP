-- ============================================================
-- Migration: Add JSONB cells array to palavras_cruzadas_grids
-- Date: 2026-04-03
--
-- Adds support for 'Coquetel' style crosswords with explicitly
-- mapped layout components.
-- ============================================================

ALTER TABLE public.palavras_cruzadas_grids 
ADD COLUMN IF NOT EXISTS cells JSONB DEFAULT '[]'::jsonb;

-- Keep the palavras table intact for backward compatibility/analytics,
-- but the main source of truth for the grid layout and interactive cells
-- will be the 'cells' object which contains InputCell and ClueCell structs.
-- 
-- type Cell = 
--  | { type: 'input', x: number, y: number, answer: string, wordIds: string[] }
--  | { type: 'clue', x: number, y: number, text: string, arrow: 'down' | 'right' | 'corner-split' | 'down-right' }
