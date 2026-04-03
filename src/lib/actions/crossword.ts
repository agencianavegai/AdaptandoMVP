"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Types ───────────────────────────────────────────────

export interface CrosswordWord {
  id: string;
  palavra: string;
  dica: string;
  pos_x: number;
  pos_y: number;
  direcao: "horizontal" | "vertical";
  ordem: number;
}

export type InputCell = {
  type: "input";
  x: number;
  y: number;
  answer: string;
  wordIds: string[];
};

export type ClueCell = {
  type: "clue";
  x: number;
  y: number;
  text: string;
  arrow: "right" | "down" | "corner-split" | "down-right";
  wordId?: string;
  word?: string;
  dica_curta?: string;
};

export type GridCell = InputCell | ClueCell;

export interface CrosswordGrid {
  id: string;
  largura: number;
  altura: number;
  palavras: CrosswordWord[];
  cells: GridCell[];
}

// ─── getCrosswordData ────────────────────────────────────

export async function getCrosswordData(mundoId: number, faseOrdem: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Apply heart recharge and get precise DB-calculated timer
  const { data: rechargeData } = await supabase.rpc("calculate_recharged_hearts", { uid: user.id });
  const nextRechargeSeconds = (rechargeData as { next_recharge_seconds: number } | null)?.next_recharge_seconds ?? 0;

  // Find the pílula for this mundo + fase
  const { data: pilula } = await supabase
    .from("pilulas")
    .select("*")
    .eq("mundo_id", mundoId)
    .eq("ordem", faseOrdem)
    .single();

  if (!pilula) throw new Error("Pílula não encontrada");

  if (user.email !== "kayrocosta@hotmail.com") {
    throw new Error("Acesso negado. O Multiverso das cruzadas está em construção.");
  }

  // Fetch the crossword grid for this pílula
  const { data: grid } = await supabase
    .from("palavras_cruzadas_grids")
    .select("*")
    .eq("pilula_id", pilula.id)
    .single();

  let crosswordGrid: CrosswordGrid | null = null;

  if (grid) {
    // Fetch words for this grid (kept for validation/backward compatibility)
    const { data: words } = await supabase
      .from("palavras_cruzadas_palavras")
      .select("*")
      .eq("grid_id", grid.id)
      .order("ordem");

    crosswordGrid = {
      id: grid.id,
      largura: grid.largura,
      altura: grid.altura,
      cells: (grid.cells as GridCell[]) || [],
      palavras: (words || []).map((w) => ({
        id: w.id,
        palavra: w.palavra,
        dica: w.dica,
        pos_x: w.pos_x,
        pos_y: w.pos_y,
        direcao: w.direcao as "horizontal" | "vertical",
        ordem: w.ordem,
      })),
    };
  }

  // Fetch volunteer data
  const { data: voluntario } = await supabase
    .from("voluntarios")
    .select("vidas_atuais, metros_linha, last_heart_lost")
    .eq("id", user.id)
    .single();

  return {
    pilula: { id: pilula.id, titulo: pilula.titulo, conteudo: pilula.conteudo, ordem: pilula.ordem },
    grid: crosswordGrid,
    vidas: voluntario?.vidas_atuais ?? 5,
    metrosLinha: voluntario?.metros_linha ?? 0,
    nextRechargeSeconds,
  };
}
