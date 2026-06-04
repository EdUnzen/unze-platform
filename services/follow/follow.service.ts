import { createClient } from "@/lib/supabase/server";
import { mapDiscoverGroupRow } from "@/lib/mappers/community.mapper";
import type { DiscoverGroup } from "@/types/community";
import type { FollowTarget } from "@/types/database";

export async function followUser(targetUserId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Nicht angemeldet") };

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    target_type: "user" as FollowTarget,
    target_user_id: targetUserId,
    target_community_id: null,
    target_group_id: null,
    target_event_id: null,
  });
  return { error };
}

export async function followCommunity(targetCommunityId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Nicht angemeldet") };

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    target_type: "community" as FollowTarget,
    target_user_id: null,
    target_community_id: targetCommunityId,
    target_group_id: null,
    target_event_id: null,
  });

  if (!error) {
    const { setCommunityActivityPref } = await import(
      "@/services/notifications/community-activity.service"
    );
    await setCommunityActivityPref(user.id, targetCommunityId, true);
  }

  return { error };
}

export async function followGroup(targetGroupId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Nicht angemeldet") };

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    target_type: "group" as FollowTarget,
    target_user_id: null,
    target_community_id: null,
    target_group_id: targetGroupId,
    target_event_id: null,
  });
  return { error };
}

export async function unfollowUser(targetUserId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Nicht angemeldet") };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("target_type", "user")
    .eq("target_user_id", targetUserId);
  return { error };
}

export async function unfollowCommunity(targetCommunityId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Nicht angemeldet") };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("target_type", "community")
    .eq("target_community_id", targetCommunityId);
  return { error };
}

export async function unfollowGroup(targetGroupId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Nicht angemeldet") };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("target_type", "group")
    .eq("target_group_id", targetGroupId);
  return { error };
}

export async function getFollowedCommunityIds(): Promise<string[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("follows")
    .select("target_community_id")
    .eq("follower_id", user.id)
    .eq("target_type", "community");

  return (data ?? [])
    .map((r: { target_community_id: string | null }) => r.target_community_id)
    .filter((id): id is string => Boolean(id));
}

export async function getFollowedGroupIds(): Promise<string[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("follows")
    .select("target_group_id")
    .eq("follower_id", user.id)
    .eq("target_type", "group");

  if (error) {
    if (error.code === "42703") return [];
    return [];
  }

  return (data ?? [])
    .map((r: { target_group_id: string | null }) => r.target_group_id)
    .filter((id): id is string => Boolean(id));
}

export async function getFollowedGroups(): Promise<DiscoverGroup[]> {
  const ids = await getFollowedGroupIds();
  if (ids.length === 0) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_groups")
    .select(
      `
      id,
      community_id,
      slug,
      title,
      description,
      sort_order,
      is_public,
      group_type,
      view_count_weekly,
      share_count,
      community:communities!inner (
        slug,
        title,
        platform_type,
        member_count,
        banner_gradient,
        is_verified,
        is_trending,
        discover_enabled,
        visibility,
        category,
        rating_avg,
        review_count,
        monetization_enabled
      )
    `,
    )
    .in("id", ids);

  if (error) return [];

  return (data ?? [])
    .map((row) => mapDiscoverGroupRow(row))
    .filter((group): group is DiscoverGroup => Boolean(group));
}

export async function isFollowingGroup(groupId: string): Promise<boolean> {
  const ids = await getFollowedGroupIds();
  return ids.includes(groupId);
}

export async function isFollowingCommunity(
  communityId: string,
): Promise<boolean> {
  const ids = await getFollowedCommunityIds();
  return ids.includes(communityId);
}

export async function followEvent(targetEventId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Nicht angemeldet") };

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    target_type: "event" as FollowTarget,
    target_user_id: null,
    target_community_id: null,
    target_group_id: null,
    target_event_id: targetEventId,
  });
  return { error };
}

export async function unfollowEvent(targetEventId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Nicht angemeldet") };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("target_type", "event")
    .eq("target_event_id", targetEventId);
  return { error };
}

export async function getFollowedEventIds(): Promise<string[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("follows")
    .select("target_event_id")
    .eq("follower_id", user.id)
    .eq("target_type", "event");

  if (error) {
    if (error.code === "42703") return [];
    return [];
  }

  return (data ?? [])
    .map((r: { target_event_id: string | null }) => r.target_event_id)
    .filter((id): id is string => Boolean(id));
}

/** Nur Follow-Status für angezeigte Events (Community-/Discover-Seiten) */
export async function getFollowedEventIdsAmong(
  eventIds: string[],
): Promise<string[]> {
  if (eventIds.length === 0) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("follows")
    .select("target_event_id")
    .eq("follower_id", user.id)
    .eq("target_type", "event")
    .in("target_event_id", eventIds);

  if (error) {
    if (error.code === "42703") return [];
    return [];
  }

  return (data ?? [])
    .map((r: { target_event_id: string | null }) => r.target_event_id)
    .filter((id): id is string => Boolean(id));
}

export async function isFollowingEvent(eventId: string): Promise<boolean> {
  const ids = await getFollowedEventIds();
  return ids.includes(eventId);
}
