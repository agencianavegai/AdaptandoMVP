-- ============================================================
-- Migration: Add game modes (quiz/crossword) and crossword tables
-- Date: 2026-04-03
--
-- SAFETY NOTES (produção):
--   ✅ ADD COLUMN com DEFAULT → preenche rows existentes automaticamente
--      sem lock exclusivo (Postgres 11+). NÃO quebra queries existentes.
--   ✅ CREATE TYPE / TABLE / INDEX → novos objetos, zero impacto.
--   ✅ INSERT de novos rows → aditivo, não toca dados existentes.
--   ❌ NENHUM DROP, ALTER TYPE, ou mudança destrutiva.
--
-- ORDEM DE EXECUÇÃO: Rode bloco a bloco no SQL Editor do Supabase.
-- ============================================================



-- ═══════════════════════════════════════════════════════════
-- BLOCO 1: Criar o enum e adicionar coluna (SEGURO)
-- ═══════════════════════════════════════════════════════════

-- 1a. Enum para modos de jogo
CREATE TYPE public.game_mode AS ENUM ('quiz', 'crossword');

-- 1b. Adicionar coluna game_mode à tabela mundo_ceus
--     DEFAULT 'quiz' → todos os 10 mundos existentes recebem 'quiz' automaticamente
--     Queries que não mencionem game_mode continuam funcionando normalmente
ALTER TABLE public.mundo_ceus
  ADD COLUMN game_mode public.game_mode NOT NULL DEFAULT 'quiz';



-- ═══════════════════════════════════════════════════════════
-- BLOCO 2: Inserir os 10 mundos de crossword (SEGURO)
--   Espelha os temas REAIS da produção (screenshot confirmada)
--   IDs serão auto-incrementados (11-20)
--   cor_fase e clima_visual idênticos aos originais
-- ═══════════════════════════════════════════════════════════

INSERT INTO public.mundo_ceus (nome_tema, clima_visual, cor_fase, ordem, ativo, game_mode, simbologia)
VALUES
  ('Voluntariado',         'Tempestade Escura',      'Laranja',       1,  true, 'crossword', '🧩'),
  ('Pesquisa',             'Chuva Intensa',          'Rosa',          2,  true, 'crossword', '🧩'),
  ('Pedagogia',            'Garoa Fria',             'Amarelo',       3,  true, 'crossword', '🧩'),
  ('Gestão de Projetos',   'Névoa Densa',            'Rosa',          4,  true, 'crossword', '🧩'),
  ('Comunicação',          'Muito Nublado',          'Roxo',          5,  true, 'crossword', '🧩'),
  ('Tecnologia',           'Parcialmente Nublado',   'Azul Claro',    6,  true, 'crossword', '🧩'),
  ('Indicadores Sociais',  'Final de Tarde',         'Azul Escuro',   7,  true, 'crossword', '🧩'),
  ('Captação de Recursos', 'Céu Aberto',             'Verde Claro',   8,  true, 'crossword', '🧩'),
  ('Financeiro',           'Brisa Perfeita',         'Verde Escuro',  9,  true, 'crossword', '🧩'),
  ('Diretoria',            'Céu de Brigadeiro',      'Laranja Escuro', 10, true, 'crossword', '🧩');



-- ═══════════════════════════════════════════════════════════
-- BLOCO 3: Tabelas de Palavras Cruzadas (SEGURO — tabelas novas)
-- ═══════════════════════════════════════════════════════════

-- 3a. Grelha (1 por fase/pílula)
CREATE TABLE public.palavras_cruzadas_grids (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilula_id  UUID NOT NULL REFERENCES public.pilulas(id) ON DELETE CASCADE,
  largura    INTEGER NOT NULL CHECK (largura BETWEEN 5 AND 20),
  altura     INTEGER NOT NULL CHECK (altura BETWEEN 5 AND 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pilula_id)
);

-- 3b. Palavras dentro da grelha
CREATE TABLE public.palavras_cruzadas_palavras (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_id    UUID NOT NULL REFERENCES public.palavras_cruzadas_grids(id) ON DELETE CASCADE,
  palavra    TEXT NOT NULL,
  dica       TEXT NOT NULL,
  pos_x      INTEGER NOT NULL CHECK (pos_x >= 0),
  pos_y      INTEGER NOT NULL CHECK (pos_y >= 0),
  direcao    TEXT NOT NULL CHECK (direcao IN ('horizontal', 'vertical')),
  ordem      INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);



-- ═══════════════════════════════════════════════════════════
-- BLOCO 4: Índices + RLS (SEGURO)
-- ═══════════════════════════════════════════════════════════

CREATE INDEX idx_crossword_grids_pilula ON public.palavras_cruzadas_grids(pilula_id);
CREATE INDEX idx_crossword_words_grid ON public.palavras_cruzadas_palavras(grid_id);

ALTER TABLE public.palavras_cruzadas_grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palavras_cruzadas_palavras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_crossword_grids" ON public.palavras_cruzadas_grids
  FOR SELECT USING (true);
CREATE POLICY "read_crossword_words" ON public.palavras_cruzadas_palavras
  FOR SELECT USING (true);
