import { createClient } from "@/lib/supabase/server";
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

export async function isFollowingCommunity(
  communityId: string,
): Promise<boolean> {
  const ids = await getFollowedCommunityIds();
  return ids.includes(communityId);
}
