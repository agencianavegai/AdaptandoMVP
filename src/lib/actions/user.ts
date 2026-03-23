"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── getRanking ──────────────────────────────────────────
// Top 50 voluntários por metros_linha DESC

export async function getRanking() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: ranking } = await supabase
    .from("voluntarios")
    .select("id, nome, avatar_url, metros_linha")
    .order("metros_linha", { ascending: false })
    .limit(50);

  // Find current user's position
  const myPosition = (ranking || []).findIndex((v) => v.id === user.id) + 1;

  return {
    ranking: ranking || [],
    myId: user.id,
    myPosition: myPosition > 0 ? myPosition : null,
  };
}

// ─── getUserProfile ──────────────────────────────────────
// Dados completos do voluntário logado

export async function getUserProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: voluntario } = await supabase
    .from("voluntarios")
    .select("id, nome, avatar_url, metros_linha, vidas_atuais, ofensiva_atual, melhor_ofensiva")
    .eq("id", user.id)
    .single();

  // Count completed worlds
  const { count: mundosConcluidos } = await supabase
    .from("progresso")
    .select("*", { count: "exact", head: true })
    .eq("voluntario_id", user.id)
    .eq("status", "concluido");

  return {
    voluntario,
    email: user.email,
    mundosConcluidos: mundosConcluidos || 0,
  };
}

// ─── logout ──────────────────────────────────────────────

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
