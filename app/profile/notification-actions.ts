"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import {
  getNotificationPreferences,
  upsertNotificationPreferences,
} from "@/services/notifications/notification-center.service";
import { updateProfile } from "@/services/user/profile.service";
import { revalidatePath } from "next/cache";

function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

export async function saveNotificationPrefsAction(
  userId: string,
  formData: FormData,
): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) return { error: "Nicht angemeldet" };

  const { error } = await upsertNotificationPreferences(userId, {
    applications: checkbox(formData, "applications"),
    moderation: checkbox(formData, "moderation"),
    invites: checkbox(formData, "invites"),
    communityEvents: checkbox(formData, "communityEvents"),
    system: checkbox(formData, "communityUpdates") || checkbox(formData, "monetizationChanges"),
    pushEnabled: checkbox(formData, "pushEnabled"),
  });

  if (error) return { error };

  const extended = {
    newGroups: checkbox(formData, "newGroups"),
    newServices: checkbox(formData, "newServices"),
    newPosts: checkbox(formData, "newPosts"),
    newReviews: checkbox(formData, "newReviews"),
    communityUpdates: checkbox(formData, "communityUpdates"),
    monetizationChanges: checkbox(formData, "monetizationChanges"),
    creatorReferrals: checkbox(formData, "creatorReferrals"),
  };

  await updateProfile(userId, {
    settings: {
      notification_extended: extended,
      notification_prefs_version: 1,
    } as Record<string, unknown>,
  });

  revalidatePath("/profile/settings");
  return { error: null };
}
