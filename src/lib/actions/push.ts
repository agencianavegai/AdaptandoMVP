"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function savePushSubscription(subscription: PushSubscriptionData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        subscription: subscription,
      },
      { onConflict: "user_id" }
    );

  if (error) throw new Error(`Falha ao salvar subscription: ${error.message}`);
  return { success: true };
}

export async function removePushSubscription() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id);

  if (error) throw new Error(`Falha ao remover subscription: ${error.message}`);
  return { success: true };
}
