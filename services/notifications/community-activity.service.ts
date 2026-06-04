import {
  COMMUNITY_ACTIVITY_NOTIFY_TYPES,
  communityActivityBody,
  communityActivityTitle,
} from "@/lib/notifications/community-activity";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlatformEventType } from "@/types/events";
import { dispatchNotification } from "./notification-center.service";

type ActivityPrefs = Record<string, boolean>;

function activityEnabled(
  prefs: ActivityPrefs,
  communityId: string,
  defaultOn = true,
): boolean {
  if (communityId in prefs) return prefs[communityId] !== false;
  return defaultOn;
}

export async function getCommunityActivityPrefs(
  userId: string,
): Promise<ActivityPrefs> {
  const supabase = await createClient();
  if (!supabase) return {};

  const { data } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", userId)
    .maybeSingle();

  const settings = (data?.settings as { community_activity?: ActivityPrefs }) ?? {};
  return settings.community_activity ?? {};
}

export async function setCommunityActivityPref(
  userId: string,
  communityId: string,
  enabled: boolean,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Nicht konfiguriert" };

  const prefs = await getCommunityActivityPrefs(userId);
  prefs[communityId] = enabled;

  const { data: row } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", userId)
    .maybeSingle();

  const settings = (row?.settings as Record<string, unknown>) ?? {};

  const { error } = await supabase
    .from("profiles")
    .update({
      settings: { ...settings, community_activity: prefs },
    })
    .eq("id", userId);

  return { error: error?.message ?? null };
}

/** Follower + Mitglieder (ohne Actor) mit Aktivitäts-Opt-in */
export async function notifyCommunityActivitySubscribers(input: {
  communityId: string;
  actorId?: string | null;
  eventType: PlatformEventType;
  payload?: Record<string, unknown>;
}): Promise<void> {
  if (!COMMUNITY_ACTIVITY_NOTIFY_TYPES.has(input.eventType)) return;
  if (!input.communityId) return;

  const admin = createAdminClient();
  const supabase = admin ?? (await createClient());
  if (!supabase) return;

  const recipientIds = new Set<string>();

  const { data: followers } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("target_type", "community")
    .eq("target_community_id", input.communityId);

  for (const row of followers ?? []) {
    if (row.follower_id && row.follower_id !== input.actorId) {
      recipientIds.add(row.follower_id as string);
    }
  }

  const { data: members } = await supabase
    .from("community_members")
    .select("user_id")
    .eq("community_id", input.communityId);

  for (const row of members ?? []) {
    if (row.user_id && row.user_id !== input.actorId) {
      recipientIds.add(row.user_id as string);
    }
  }

  if (recipientIds.size === 0) return;

  const payload = input.payload ?? {};
  const title = communityActivityTitle(input.eventType, payload);
  const body = communityActivityBody(input.eventType, payload);

  const ids = [...recipientIds];
  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, settings")
    .in("id", ids);

  const prefsByUser = new Map<string, ActivityPrefs>();
  for (const row of profileRows ?? []) {
    const settings = (row.settings as { community_activity?: ActivityPrefs }) ?? {};
    prefsByUser.set(row.id as string, settings.community_activity ?? {});
  }

  await Promise.all(
    ids.map(async (userId) => {
      const prefs = prefsByUser.get(userId) ?? {};
      if (!activityEnabled(prefs, input.communityId)) return;

      await dispatchNotification({
        userId,
        category: "community_event",
        type: input.eventType,
        title,
        body,
        data: {
          communityId: input.communityId,
          eventType: input.eventType,
          ...payload,
        },
      });
    }),
  );
}
