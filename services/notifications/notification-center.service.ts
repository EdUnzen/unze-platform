import { createClient } from "@/lib/supabase/server";
import type {
  NotificationCategory,
  NotificationItem,
  NotificationPreferences,
} from "@/types/governance";
import { insertNotificationInDb } from "./notification.repository";

const CATEGORY_TO_TYPE: Record<NotificationCategory, string> = {
  application: "application",
  moderation: "moderation",
  invite: "invite",
  community_event: "community_event",
  system: "system",
};

export async function dispatchNotification(input: {
  userId: string;
  category: NotificationCategory;
  type?: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}) {
  const prefs = await getNotificationPreferences(input.userId);
  if (!isCategoryEnabled(prefs, input.category)) return { error: null };

  return insertNotificationInDb({
    userId: input.userId,
    title: input.title,
    body: input.body,
    type: input.type ?? CATEGORY_TO_TYPE[input.category],
    data: {
      category: input.category,
      ...input.data,
    },
  });
}

function isCategoryEnabled(
  prefs: NotificationPreferences | null,
  category: NotificationCategory,
): boolean {
  if (!prefs) return true;
  switch (category) {
    case "application":
      return prefs.applications;
    case "moderation":
      return prefs.moderation;
    case "invite":
      return prefs.invites;
    case "community_event":
      return prefs.communityEvents;
    case "system":
      return prefs.system;
    default:
      return true;
  }
}

export async function getNotifications(
  userId: string,
  options?: { unreadOnly?: boolean; limit?: number },
): Promise<NotificationItem[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 30);

  if (options?.unreadOnly) {
    query = query.is("read_at", null);
  }

  const { data } = await query;

  return (data ?? []).map(mapNotificationRow);
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  return count ?? 0;
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function markAllNotificationsRead(
  userId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) return { error: error.message };
  return { error: null };
}

export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferences | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;

  return {
    userId: data.user_id as string,
    applications: data.applications as boolean,
    moderation: data.moderation as boolean,
    invites: data.invites as boolean,
    communityEvents: data.community_events as boolean,
    system: data.system as boolean,
    pushEnabled: data.push_enabled as boolean,
  };
}

export async function upsertNotificationPreferences(
  userId: string,
  prefs: Partial<Omit<NotificationPreferences, "userId">>,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: userId,
    applications: prefs.applications ?? true,
    moderation: prefs.moderation ?? true,
    invites: prefs.invites ?? true,
    community_events: prefs.communityEvents ?? true,
    system: prefs.system ?? true,
    push_enabled: prefs.pushEnabled ?? false,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  return { error: null };
}

function mapNotificationRow(row: Record<string, unknown>): NotificationItem {
  const data = (row.data as Record<string, unknown>) ?? {};
  const category =
    (data.category as NotificationCategory) ??
    mapTypeToCategory(row.type as string);

  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as string,
    category,
    title: row.title as string,
    body: row.body as string | null,
    data,
    readAt: row.read_at as string | null,
    createdAt: row.created_at as string,
  };
}

function mapTypeToCategory(type: string): NotificationCategory {
  if (type === "application") return "application";
  if (type === "moderation") return "moderation";
  if (type === "invite") return "invite";
  if (type === "community_event") return "community_event";
  return "system";
}
