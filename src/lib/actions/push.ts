"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

export async function savePushSubscription(subscription: PushSubscriptionData) {
  // Validate user identity via cookies
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Use admin client to bypass RLS
  const admin = getAdminClient();
  const { error } = await admin
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
  // Validate user identity via cookies
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Use admin client to bypass RLS
  const admin = getAdminClient();
  const { error } = await admin
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id);

  if (error) throw new Error(`Falha ao remover subscription: ${error.message}`);
  return { success: true };
}
