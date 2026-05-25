"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications/notification-center.service";
import { revalidatePath } from "next/cache";

export async function loadNotifications(unreadOnly = false) {
  const user = await getCurrentUser();
  if (!user) return { notifications: [], unreadCount: 0 };

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(user.id, { unreadOnly, limit: 50 }),
    getUnreadNotificationCount(user.id),
  ]);

  return { notifications, unreadCount };
}

export async function markReadAction(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const result = await markNotificationRead(notificationId, user.id);
  if (result.error) return { error: result.error };

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllReadAction() {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const result = await markAllNotificationsRead(user.id);
  if (result.error) return { error: result.error };

  revalidatePath("/notifications");
  return { success: true };
}

export async function getUnreadCountAction() {
  const user = await getCurrentUser();
  if (!user) return { count: 0 };

  const count = await getUnreadNotificationCount(user.id);
  return { count };
}
