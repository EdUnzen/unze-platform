/**
 * Notifications & Push-Vorbereitung — architecture/modules/NOTIFICATION_INTERACTION_SYSTEM.md
 */

import { createClient } from "@/lib/supabase/server";
import { insertNotificationInDb } from "./notification.repository";

export async function getUnreadNotifications(limit = 20) {
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

/** Push-Subscription speichern (Web Push API) */
export async function savePushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}) {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Nicht angemeldet") };

  return supabase.from("push_subscriptions").upsert({
    user_id: user.id,
    endpoint: input.endpoint,
    p256dh: input.p256dh,
    auth: input.auth,
    user_agent: input.userAgent ?? null,
  });
}

/** Systemnachrichten für Access & Governance */
export async function createSystemNotification(input: {
  userId: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}) {
  return insertNotificationInDb({
    userId: input.userId,
    title: input.title,
    body: input.body,
    type: "system",
    data: input.data,
  });
}
