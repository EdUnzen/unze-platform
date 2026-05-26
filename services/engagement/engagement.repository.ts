import { createClient } from "@/lib/supabase/server";

export async function incrementCommunityShareCount(
  communityId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error: fetchError } = await supabase
    .from("communities")
    .select("share_count")
    .eq("id", communityId)
    .maybeSingle();

  if (fetchError?.message?.includes("share_count")) {
    return { error: null };
  }
  if (fetchError || !data) return { error: fetchError?.message ?? "Nicht gefunden" };

  const next = (data.share_count as number) + 1;
  const { error } = await supabase
    .from("communities")
    .update({ share_count: next })
    .eq("id", communityId);

  return { error: error?.message ?? null };
}

export async function incrementGroupShareCount(
  groupId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error: fetchError } = await supabase
    .from("community_groups")
    .select("share_count")
    .eq("id", groupId)
    .maybeSingle();

  if (fetchError?.message?.includes("share_count")) {
    return { error: null };
  }
  if (fetchError || !data) return { error: fetchError?.message ?? "Nicht gefunden" };

  const next = (data.share_count as number) + 1;
  const { error } = await supabase
    .from("community_groups")
    .update({ share_count: next })
    .eq("id", groupId);

  return { error: error?.message ?? null };
}

export async function incrementCommunityViewCount(
  communityId: string,
): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;

  const { data, error: fetchError } = await supabase
    .from("communities")
    .select("view_count_total, view_count_weekly")
    .eq("id", communityId)
    .maybeSingle();

  if (fetchError?.message?.includes("view_count")) return;
  if (!data) return;

  await supabase
    .from("communities")
    .update({
      view_count_total: Number(data.view_count_total ?? 0) + 1,
      view_count_weekly: Number(data.view_count_weekly ?? 0) + 1,
    })
    .eq("id", communityId);
}

export async function incrementPostShareCount(
  postId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error: fetchError } = await supabase
    .from("posts")
    .select("share_count")
    .eq("id", postId)
    .maybeSingle();

  if (fetchError?.message?.includes("share_count")) {
    return { error: null };
  }
  if (fetchError || !data) return { error: fetchError?.message ?? "Nicht gefunden" };

  const next = Number(data.share_count ?? 0) + 1;
  const { error } = await supabase
    .from("posts")
    .update({ share_count: next })
    .eq("id", postId);

  return { error: error?.message ?? null };
}

export async function incrementPostViewCount(postId: string): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;

  const { data, error: fetchError } = await supabase
    .from("posts")
    .select("view_count")
    .eq("id", postId)
    .maybeSingle();

  if (fetchError?.message?.includes("view_count")) return;
  if (!data) return;

  await supabase
    .from("posts")
    .update({ view_count: Number(data.view_count ?? 0) + 1 })
    .eq("id", postId);
}

export async function fetchNetworkFollowCounts(
  viewerId: string,
  communityIds: string[],
): Promise<Record<string, number>> {
  const unique = [...new Set(communityIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const { data: myMemberships } = await supabase
    .from("community_members")
    .select("community_id")
    .eq("user_id", viewerId)
    .is("deleted_at", null);

  const myCommunityIds = (myMemberships ?? []).map((r) => r.community_id as string);
  if (myCommunityIds.length === 0) return {};

  const { data: peers } = await supabase
    .from("community_members")
    .select("user_id, community_id")
    .in("community_id", myCommunityIds)
    .neq("user_id", viewerId)
    .is("deleted_at", null);

  const peerIds = [...new Set((peers ?? []).map((r) => r.user_id as string))];
  if (peerIds.length === 0) return {};

  const { data: follows } = await supabase
    .from("follows")
    .select("follower_id, target_community_id")
    .eq("target_type", "community")
    .in("follower_id", peerIds)
    .in("target_community_id", unique);

  const result: Record<string, number> = {};
  for (const id of unique) result[id] = 0;
  for (const row of follows ?? []) {
    const cid = row.target_community_id as string;
    if (result[cid] !== undefined) result[cid] += 1;
  }

  return result;
}
