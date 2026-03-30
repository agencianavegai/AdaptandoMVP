import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Configure VAPID for web-push safely
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:contato@institutoadapo.org.br",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn("VAPID keys not configured for broadcast. Push notifications will not work.");
}

// Admin Supabase client (bypasses RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

export async function POST(request: NextRequest) {
  try {
    const { title, body, url } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "title and body are required payload fields" },
        { status: 400 }
      );
    }

    // AUTHENTICATION BARRIER (Only Admins/Developers can Broadcast)
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const userClient = await createSupabaseServerClient();
    const { data: { user } } = await userClient.auth.getUser();

    const adminEmails = process.env.ADMIN_EMAIL 
      ? process.env.ADMIN_EMAIL.split(',')
      : ["filipegallo2@gmail.com"]; // Fallback to main dev/po

    if (!user || !user.email || !adminEmails.includes(user.email)) {
       return NextResponse.json(
         { error: "Acesso Negado: Você não tem permissão de Developer para disparar o Megafone." },
         { status: 403 }
       );
    }

    const supabase = getAdminClient();

    // Fetch ALL subscriptions (admin privileges)
    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("user_id, subscription");

    if (error) {
       console.error("Error fetching subscriptions:", error);
       return NextResponse.json(
         { error: "Error fetching subscriptions" },
         { status: 500 }
       );
    }
    
    if (!subs || subs.length === 0) {
      return NextResponse.json(
        { error: "No subscriptions found" },
        { status: 404 }
      );
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/mapa",
    });

    let successCount = 0;
    let failedCount = 0;

    // Disparar notificações em lote via Promise.allSettled
    const promises = subs.map(async (subRecord) => {
      try {
        await webpush.sendNotification(subRecord.subscription, payload);
        successCount++;
      } catch (err: any) {
        failedCount++;
        const status = err?.statusCode;
        console.error(`[Broadcast API] Error sending to user ${subRecord.user_id}: ${status} - ${err?.message}`);

        // Trata erro 410 (Gone) ou 404 (Not Found) - Inscrição expirada ou inválida
        if (status === 410 || status === 404 || err?.message?.includes("expired")) {
             console.log(`[Broadcast API] Removing invalid subscription for user: ${subRecord.user_id}`);
             await supabase
               .from("push_subscriptions")
               .delete()
               .eq("user_id", subRecord.user_id);
        }
      }
    });

    await Promise.allSettled(promises);

    return NextResponse.json({ 
      success: true, 
      message: "Broadcast completed", 
      results: { 
         total: subs.length,
         success: successCount,
         failed: failedCount
      }
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Broadcast base error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
