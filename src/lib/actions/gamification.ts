"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Types ───────────────────────────────────────────────

interface Alternativa {
  texto: string;
  correta: boolean;
}

interface Quiz {
  id: string;
  pergunta: string;
  alternativas: Alternativa[];
  explicacao: string | null;
  ordem: number;
}

interface Pilula {
  id: string;
  titulo: string;
  conteudo: string;
  ordem: number;
}

// ─── getTrilhaData ───────────────────────────────────────

export async function getTrilhaData(mundoId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const [mundoRes, pilulasRes, progressoRes, voluntarioRes] = await Promise.all([
    supabase.from("mundo_ceus").select("*").eq("id", mundoId).single(),
    supabase.from("pilulas").select("id, titulo, ordem").eq("mundo_id", mundoId).order("ordem"),
    supabase.from("progresso").select("*").eq("voluntario_id", user.id).eq("mundo_id", mundoId).single(),
    supabase.from("voluntarios").select("vidas_atuais, metros_linha").eq("id", user.id).single(),
  ]);

  return {
    mundo: mundoRes.data,
    fases: pilulasRes.data || [],
    progresso: progressoRes.data,
    voluntario: voluntarioRes.data,
  };
}

// ─── getArenaData ────────────────────────────────────────

export async function getArenaData(mundoId: number, faseOrdem: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: pilula } = await supabase
    .from("pilulas")
    .select("*")
    .eq("mundo_id", mundoId)
    .eq("ordem", faseOrdem)
    .single();

  if (!pilula) throw new Error("Pílula não encontrada");

  const [quizzesRes, voluntarioRes] = await Promise.all([
    supabase.from("quizzes").select("*").eq("pilula_id", pilula.id).order("ordem"),
    supabase.from("voluntarios").select("vidas_atuais, metros_linha").eq("id", user.id).single(),
  ]);

  return {
    pilula: pilula as Pilula,
    quizzes: (quizzesRes.data || []) as Quiz[],
    vidas: voluntarioRes.data?.vidas_atuais ?? 5,
    metrosLinha: voluntarioRes.data?.metros_linha ?? 0,
  };
}

// ─── submitAnswer ────────────────────────────────────────

export async function submitAnswer(quizId: string, respostaIdx: number, acertou: boolean) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Record the answer
  await supabase.from("respostas_quiz").upsert({
    voluntario_id: user.id,
    quiz_id: quizId,
    resposta_idx: respostaIdx,
    acertou,
  }, { onConflict: "voluntario_id,quiz_id" });

  if (acertou) {
    // +10 XP (metros de linha)
    await supabase.rpc("increment_metros_linha", { uid: user.id, amount: 10 });
  } else {
    // -1 vida (min 0)
    await supabase.rpc("decrement_vida", { uid: user.id });
  }

  // Fetch updated stats
  const { data: vol } = await supabase
    .from("voluntarios")
    .select("vidas_atuais, metros_linha")
    .eq("id", user.id)
    .single();

  return {
    acertou,
    novasVidas: vol?.vidas_atuais ?? 0,
    novosMetros: vol?.metros_linha ?? 0,
  };
}

// ─── completeFase ────────────────────────────────────────

export async function completeFase(mundoId: number, faseOrdem: number, pontosGanhos: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const TOTAL_FASES = 6;

  if (faseOrdem < TOTAL_FASES) {
    // Advance to the next phase
    await supabase
      .from("progresso")
      .update({ pilula_atual: faseOrdem + 1, pontuacao_local: pontosGanhos })
      .eq("voluntario_id", user.id)
      .eq("mundo_id", mundoId);
  } else {
    // Phase 6 completed = World completed!
    // 1. Mark world as concluido
    await supabase
      .from("progresso")
      .update({ status: "concluido", pilula_atual: TOTAL_FASES, pontuacao_local: pontosGanhos })
      .eq("voluntario_id", user.id)
      .eq("mundo_id", mundoId);

    // 2. Bonus +50 XP
    await supabase.rpc("increment_metros_linha", { uid: user.id, amount: 50 });

    // 3. Unlock next world
    const { data: nextMundo } = await supabase
      .from("mundo_ceus")
      .select("id")
      .eq("ordem", (await supabase.from("mundo_ceus").select("ordem").eq("id", mundoId).single()).data!.ordem + 1)
      .single();

    if (nextMundo) {
      // Upsert the next world's progress to 'ativo'
      await supabase.from("progresso").upsert({
        voluntario_id: user.id,
        mundo_id: nextMundo.id,
        status: "ativo",
        pilula_atual: 1,
        pontuacao_local: 0,
      }, { onConflict: "voluntario_id,mundo_id" });
    }
  }

  revalidatePath("/mapa");
  revalidatePath(`/trilha/${mundoId}`);

  return { mundoConcluido: faseOrdem >= TOTAL_FASES };
}
