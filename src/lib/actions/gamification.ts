"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";


// ─── Streak Helpers ──────────────────────────────────────

function toUTCDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Read-time streak decay: if the user hasn't completed anything
 * since "yesterday" (UTC), silently reset their streak to 0 in the DB
 * and return the corrected value.
 */
async function checkAndDecayStreak(
  supabase: SupabaseClient,
  userId: string,
  vol: { ofensiva_atual: number; last_completed_at: string | null }
): Promise<number> {
  if (vol.ofensiva_atual <= 0) return 0;
  if (!vol.last_completed_at) return vol.ofensiva_atual;

  const now = new Date();
  const todayStr = toUTCDateStr(now);
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = toUTCDateStr(yesterday);

  const lastStr = toUTCDateStr(new Date(vol.last_completed_at));

  // If last activity was today or yesterday, streak is still valid
  if (lastStr === todayStr || lastStr === yesterdayStr) {
    return vol.ofensiva_atual;
  }

  // Gap > 1 day: silently reset the streak in the DB
  await supabase
    .from("voluntarios")
    .update({ ofensiva_atual: 0 })
    .eq("id", userId);

  return 0;
}

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

// ─── getRechargedHearts ──────────────────────────────────
// Calls the DB function to calculate and apply recharged hearts

export async function getRechargedHearts() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data } = await supabase.rpc("calculate_recharged_hearts", { uid: user.id });
  return data as { vidas: number; next_recharge_seconds: number } | null;
}

// ─── getMapaData ─────────────────────────────────────────

export async function getMapaData() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Apply heart recharge globally for the map and get precise DB-calculated timer
  const { data: rechargeData } = await supabase.rpc("calculate_recharged_hearts", { uid: user.id });
  const nextRechargeSeconds = (rechargeData as any)?.next_recharge_seconds ?? 0;

  const [mundosRes, progressoRes, voluntarioRes] = await Promise.all([
    supabase.from("mundo_ceus").select("*").eq("ativo", true).order("ordem", { ascending: true }),
    supabase.from("progresso").select("*").eq("voluntario_id", user.id),
    supabase.from("voluntarios").select("*").eq("id", user.id).single(),
  ]);

  // Read-time streak decay: correct stale ofensiva before sending to frontend
  const vol = voluntarioRes.data;
  if (vol) {
    vol.ofensiva_atual = await checkAndDecayStreak(supabase, user.id, {
      ofensiva_atual: vol.ofensiva_atual,
      last_completed_at: vol.last_completed_at,
    });
  }

  return {
    mundos: mundosRes.data || [],
    progressos: progressoRes.data || [],
    voluntario: vol,
    nextRechargeSeconds,
  };
}

// ─── getTrilhaData ───────────────────────────────────────


export async function getTrilhaData(mundoId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Apply heart recharge and get precise DB-calculated timer
  const { data: rechargeData } = await supabase.rpc("calculate_recharged_hearts", { uid: user.id });
  const nextRechargeSeconds = (rechargeData as any)?.next_recharge_seconds ?? 0;

  const [mundoRes, pilulasRes, progressoRes, voluntarioRes] = await Promise.all([
    supabase.from("mundo_ceus").select("*").eq("id", mundoId).single(),
    supabase.from("pilulas").select("id, titulo, ordem").eq("mundo_id", mundoId).order("ordem"),
    supabase.from("progresso").select("*").eq("voluntario_id", user.id).eq("mundo_id", mundoId).single(),
    supabase.from("voluntarios").select("vidas_atuais, metros_linha, last_heart_lost").eq("id", user.id).single(),
  ]);

  return {
    mundo: mundoRes.data,
    fases: pilulasRes.data || [],
    progresso: progressoRes.data,
    voluntario: voluntarioRes.data,
    nextRechargeSeconds,
  };
}

// ─── getArenaData ────────────────────────────────────────

export async function getArenaData(mundoId: number, faseOrdem: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Apply heart recharge and get precise DB-calculated timer
  const { data: rechargeData } = await supabase.rpc("calculate_recharged_hearts", { uid: user.id });
  const nextRechargeSeconds = (rechargeData as any)?.next_recharge_seconds ?? 0;

  const { data: pilula } = await supabase
    .from("pilulas")
    .select("*")
    .eq("mundo_id", mundoId)
    .eq("ordem", faseOrdem)
    .single();

  if (!pilula) throw new Error("Pílula não encontrada");

  const [quizzesRes, voluntarioRes] = await Promise.all([
    supabase.from("quizzes").select("*").eq("pilula_id", pilula.id).order("ordem"),
    supabase.from("voluntarios").select("vidas_atuais, metros_linha, last_heart_lost").eq("id", user.id).single(),
  ]);

  const rawQuizzes = (quizzesRes.data || []) as Quiz[];

  return {
    pilula: pilula as Pilula,
    quizzes: rawQuizzes,
    vidas: voluntarioRes.data?.vidas_atuais ?? 5,
    metrosLinha: voluntarioRes.data?.metros_linha ?? 0,
    nextRechargeSeconds,
  };
}

// ─── submitAnswer ────────────────────────────────────────

export async function submitAnswer(quizId: string, respostaIdx: number, acertou: boolean) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  await supabase.from("respostas_quiz").upsert({
    voluntario_id: user.id,
    quiz_id: quizId,
    resposta_idx: respostaIdx,
    acertou,
  }, { onConflict: "voluntario_id,quiz_id" });

  if (acertou) {
    await supabase.rpc("increment_metros_linha", { uid: user.id, amount: 10 });
  } else {
    await supabase.rpc("decrement_vida", { uid: user.id });
  }

  const { data: rechargeData } = await supabase.rpc("calculate_recharged_hearts", { uid: user.id });
  const nextRechargeSeconds = (rechargeData as any)?.next_recharge_seconds ?? 0;

  const { data: vol } = await supabase
    .from("voluntarios")
    .select("vidas_atuais, metros_linha, last_heart_lost")
    .eq("id", user.id)
    .single();

  return {
    acertou,
    novasVidas: vol?.vidas_atuais ?? 0,
    novosMetros: vol?.metros_linha ?? 0,
    nextRechargeSeconds,
  };
}

// ─── completeFase ────────────────────────────────────────

export async function completeFase(mundoId: number, faseOrdem: number, pontosGanhos: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const TOTAL_FASES = 6;

  // ── Streak logic (UTC-consistent) ──
  const { data: vol } = await supabase
    .from("voluntarios")
    .select("ofensiva_atual, melhor_ofensiva, last_completed_at")
    .eq("id", user.id)
    .single();

  let newStreak = 1;
  let streakIncreased = false;

  if (vol) {
    const now = new Date();
    const todayStr = toUTCDateStr(now);

    if (vol.last_completed_at) {
      const lastStr = toUTCDateStr(new Date(vol.last_completed_at));

      if (lastStr === todayStr) {
        // Same day — keep current streak, don't double-count
        newStreak = vol.ofensiva_atual;
      } else {
        const yesterday = new Date(now);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        const yesterdayStr = toUTCDateStr(yesterday);

        if (lastStr === yesterdayStr) {
          // Played yesterday — increment
          newStreak = vol.ofensiva_atual + 1;
          streakIncreased = true;
        } else {
          // Gap > 1 day — reset to 1 (starting fresh today)
          newStreak = 1;
          streakIncreased = true;
        }
      }
    } else {
      // First time ever completing a phase
      streakIncreased = true;
    }

    const bestStreak = Math.max(vol.melhor_ofensiva, newStreak);

    await supabase
      .from("voluntarios")
      .update({
        ofensiva_atual: newStreak,
        melhor_ofensiva: bestStreak,
        last_completed_at: now.toISOString(),
        ultimo_acesso: now.toISOString(),
      })
      .eq("id", user.id);
  }

  // ── Phase progression ──
  if (faseOrdem < TOTAL_FASES) {
    await supabase
      .from("progresso")
      .update({ pilula_atual: faseOrdem + 1, pontuacao_local: pontosGanhos })
      .eq("voluntario_id", user.id)
      .eq("mundo_id", mundoId);
  } else {
    await supabase
      .from("progresso")
      .update({ status: "concluido", pilula_atual: TOTAL_FASES, pontuacao_local: pontosGanhos })
      .eq("voluntario_id", user.id)
      .eq("mundo_id", mundoId);

    await supabase.rpc("increment_metros_linha", { uid: user.id, amount: 50 });

    const { data: nextMundo } = await supabase
      .from("mundo_ceus")
      .select("id")
      .eq("ordem", (await supabase.from("mundo_ceus").select("ordem").eq("id", mundoId).single()).data!.ordem + 1)
      .single();

    if (nextMundo) {
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

  return {
    mundoConcluido: faseOrdem >= TOTAL_FASES,
    streakIncreased,
    newStreak,
  };
}
