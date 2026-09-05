"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import {
  getNotificationPreferences,
  upsertNotificationPreferences,
} from "@/services/notifications/notification-center.service";
import { updateProfile } from "@/services/user/profile.service";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_PERSONAL_MILESTONE_PREFS,
  type PersonalMilestonePrefs,
} from "@/lib/notifications/personal-milestones";
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
      personal_milestones: {
        ownAwards: checkbox(formData, "ownAwards"),
        ownRoles: checkbox(formData, "ownRoles"),
      } satisfies PersonalMilestonePrefs,
      notification_prefs_version: 2,
    } as Record<string, unknown>,
  });

  revalidatePath("/profile/settings");
  revalidatePath("/notifications");
  return { error: null };
}

export async function loadNotificationPrefsForm(userId: string) {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) return null;

  const supabase = await createClient();
  const [prefs, profileRes] = await Promise.all([
    getNotificationPreferences(userId),
    supabase
      ? supabase.from("profiles").select("settings").eq("id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const settings = (profileRes.data?.settings as Record<string, unknown>) ?? {};
  const extended = (settings.notification_extended as Record<string, boolean>) ?? {};
  const personal =
    (settings.personal_milestones as Partial<PersonalMilestonePrefs>) ?? {};

  return {
    applications: prefs?.applications ?? true,
    moderation: prefs?.moderation ?? true,
    invites: prefs?.invites ?? true,
    communityEvents: prefs?.communityEvents ?? true,
    system: prefs?.system ?? true,
    pushEnabled: prefs?.pushEnabled ?? false,
    newGroups: extended.newGroups ?? true,
    newServices: extended.newServices ?? true,
    newPosts: extended.newPosts ?? true,
    newReviews: extended.newReviews ?? true,
    communityUpdates: extended.communityUpdates ?? true,
    monetizationChanges: extended.monetizationChanges ?? true,
    creatorReferrals: extended.creatorReferrals ?? true,
    ownAwards: personal.ownAwards ?? DEFAULT_PERSONAL_MILESTONE_PREFS.ownAwards,
    ownRoles: personal.ownRoles ?? DEFAULT_PERSONAL_MILESTONE_PREFS.ownRoles,
  };
}
