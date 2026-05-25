/**
 * Realtime-Struktur für Benachrichtigungen (Vorbereitung).
 * Später: Supabase Realtime Channel auf `notifications` + Event-Bus-Bridge.
 */

import type { NotificationItem } from "@/types/governance";

export const NOTIFICATIONS_REALTIME_CHANNEL = "unze:notifications";

export type NotificationRealtimeEvent =
  | { type: "insert"; notification: NotificationItem }
  | { type: "update"; notification: NotificationItem }
  | { type: "mark_all_read"; userId: string };

/** Client-Hook-Platzhalter — wird mit @supabase/supabase-js Realtime verdrahtet */
export function subscribeToUserNotifications(
  userId: string,
  onEvent: (event: NotificationRealtimeEvent) => void,
): () => void {
  void userId;
  void onEvent;
  return () => {};
}

/** Deep-Link-Payload für Push/In-App (später FCM / Web Push) */
export function buildNotificationDeepLink(notification: NotificationItem): string | null {
  const slug =
    (notification.data?.communitySlug as string | undefined) ??
    (notification.data?.slug as string | undefined);

  switch (notification.category) {
    case "application":
      return slug ? `/dashboard/community/${slug}/requests` : "/dashboard";
    case "moderation":
      return slug ? `/dashboard/community/${slug}/members` : "/notifications";
    case "invite":
      return slug ? `/community/${slug}` : "/discover";
    case "community_event":
      return slug ? `/community/${slug}` : "/notifications";
    default:
      return "/notifications";
  }
}
