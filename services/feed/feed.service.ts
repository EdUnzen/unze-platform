import { mapPostRow, type FeedPost } from "@/lib/mappers/post.mapper";
import { createClient } from "@/lib/supabase/server";
import type { PostRow } from "@/types/database";
import { getFollowedCommunityIds } from "@/services/follow/follow.service";

export async function getDiscoverFeedPosts(limit = 20): Promise<FeedPost[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[feed.service] discover:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapPostRow(row as PostRow));
}

export async function getFeedCommunityMeta(
  communityIds: string[],
): Promise<Record<string, { title: string; slug: string }>> {
  const unique = [...new Set(communityIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("communities")
    .select("id, title, slug")
    .in("id", unique);

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((row) => [
      row.id as string,
      { title: row.title as string, slug: row.slug as string },
    ]),
  );
}

export async function getPersonalFeedPosts(limit = 20): Promise<FeedPost[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const followedCommunityIds = await getFollowedCommunityIds();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (user || followedCommunityIds.length > 0) {
    const filters: string[] = [];
    if (user) filters.push(`author_id.eq.${user.id}`);
    if (followedCommunityIds.length > 0) {
      filters.push(`community_id.in.(${followedCommunityIds.join(",")})`);
    }
    query = query.or(filters.join(","));
  } else {
    return getDiscoverFeedPosts(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[feed.service] personal:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapPostRow(row as PostRow));
}

export async function getCommunityPosts(
  communityId: string,
  limit = 20,
): Promise<FeedPost[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("community_id", communityId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[feed.service] community:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapPostRow(row as PostRow));
}

export async function createPost(input: {
  content: string;
  title?: string;
  communityId?: string;
  visibility?: "public" | "followers" | "community" | "private";
  postType?: "text" | "image" | "poll" | "event" | "community_update" | "question";
}) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase nicht konfiguriert") };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Nicht angemeldet") };

  return supabase
    .from("posts")
    .insert({
      author_id: user.id,
      content: input.content,
      title: input.title ?? null,
      community_id: input.communityId ?? null,
      visibility: input.visibility ?? (input.communityId ? "community" : "public"),
      post_type: input.postType ?? "text",
    })
    .select()
    .single();
}
