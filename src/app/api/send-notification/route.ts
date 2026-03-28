import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Configure VAPID for web-push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:contato@institutoadapo.org.br",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

// Admin Supabase client (bypasses RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, body, url } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json(
        { error: "userId, title, and body are required" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Fetch subscription for user
    const { data: sub, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId)
      .single();

    if (error || !sub) {
      return NextResponse.json(
        { error: "No subscription found for user" },
        { status: 404 }
      );
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
    });

    await webpush.sendNotification(sub.subscription, payload);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Push notification error:", message);

    // If subscription expired, clean it up
    if (message.includes("410") || message.includes("expired")) {
      return NextResponse.json(
        { error: "Subscription expired, removed" },
        { status: 410 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
