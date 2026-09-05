import { isPushConfigured } from "@/lib/push/vapid";
import { getNotificationPreferences } from "@/services/notifications/notification-center.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const [prefs, supabase] = await Promise.all([
    getNotificationPreferences(user.id),
    createClient(),
  ]);

  let subscribed = false;
  if (supabase) {
    const { count } = await supabase
      .from("push_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    subscribed = (count ?? 0) > 0;
  }

  return NextResponse.json({
    pushEnabled: prefs?.pushEnabled ?? false,
    subscribed,
    pushConfigured: isPushConfigured(),
  });
}
