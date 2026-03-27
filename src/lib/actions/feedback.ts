"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function submitFeedback(mensagem: string, tipo: "sugestao" | "bug") {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase.from("user_feedbacks").insert({
    user_id: user.id,
    mensagem,
    tipo,
  });

  if (error) {
    console.error("Erro ao enviar feedback:", error);
    throw new Error("Falha ao salvar feedback");
  }

  return { success: true };
}
