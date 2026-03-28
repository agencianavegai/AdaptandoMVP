"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── getRanking ──────────────────────────────────────────
// Top 50 voluntários por metros_linha DESC

export async function getRanking(filter: "adapete" | "global" = "adapete") {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  let query = supabase
    .from("voluntarios")
    .select("id, nome, avatar_url, avatar_type, uploaded_url, character_id, avatar_bg_color, metros_linha, is_adapete")
    .order("metros_linha", { ascending: false })
    .limit(50);

  if (filter === "adapete") {
    query = query.eq("is_adapete", true);
  }

  const { data: ranking } = await query;

  // Find current user's position
  const myPosition = (ranking || []).findIndex((v) => v.id === user.id) + 1;

  // Get current user's adapete status
  const myRecord = (ranking || []).find((v) => v.id === user.id);

  return {
    ranking: ranking || [],
    myId: user.id,
    myPosition: myPosition > 0 ? myPosition : null,
    isAdapete: myRecord?.is_adapete ?? false,
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
    .select("id, nome, avatar_url, avatar_type, uploaded_url, character_id, avatar_bg_color, metros_linha, vidas_atuais, ofensiva_atual, melhor_ofensiva, last_completed_at")
    .eq("id", user.id)
    .single();

  // Read-time streak decay: if gap > 1 day, show 0 and silently reset
  if (voluntario && voluntario.ofensiva_atual > 0 && voluntario.last_completed_at) {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const lastStr = new Date(voluntario.last_completed_at).toISOString().slice(0, 10);

    if (lastStr !== todayStr && lastStr !== yesterdayStr) {
      voluntario.ofensiva_atual = 0;
      await supabase
        .from("voluntarios")
        .update({ ofensiva_atual: 0 })
        .eq("id", user.id);
    }
  }

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
