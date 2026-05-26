import { mapPostRow, type FeedPost, type FeedPostAuthor } from "@/lib/mappers/post.mapper";
import { createClient } from "@/lib/supabase/server";
import type { PostRow } from "@/types/database";
import { getFollowedCommunityIds } from "@/services/follow/follow.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { fetchViewerLikedPostIds } from "./like.repository";

export async function getFeedAuthorMeta(
  authorIds: string[],
): Promise<Record<string, FeedPostAuthor>> {
  const unique = [...new Set(authorIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", unique);

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((row) => [
      row.id as string,
      {
        name: (row.display_name as string) ?? (row.username as string) ?? "Mitglied",
        username: (row.username as string) ?? null,
        avatarUrl: (row.avatar_url as string) ?? null,
      },
    ]),
  );
}

export async function enrichFeedPosts(posts: FeedPost[]): Promise<FeedPost[]> {
  if (posts.length === 0) return posts;

  const authorIds = posts.map((p) => p.authorId);
  const communityIds = posts
    .map((p) => p.communityId)
    .filter((id): id is string => Boolean(id));
  const postIds = posts.map((p) => p.id);

  const user = await getCurrentUser();
  const [authors, communityNames, likedIds] = await Promise.all([
    getFeedAuthorMeta(authorIds),
    getFeedCommunityMeta(communityIds),
    fetchViewerLikedPostIds(postIds, user?.id ?? null),
  ]);

  return posts.map((post) => ({
    ...post,
    author: authors[post.authorId],
    community:
      post.communityId && communityNames[post.communityId]
        ? communityNames[post.communityId]
        : post.community,
    isLikedByViewer: likedIds.has(post.id),
  }));
}

export async function getPostById(postId: string): Promise<FeedPost | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (error || !data) return null;

  const [enriched] = await enrichFeedPosts([mapPostRow(data as PostRow)]);
  return enriched ?? null;
}

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

  return enrichFeedPosts((data ?? []).map((row) => mapPostRow(row as PostRow)));
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

  return enrichFeedPosts((data ?? []).map((row) => mapPostRow(row as PostRow)));
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

  return enrichFeedPosts((data ?? []).map((row) => mapPostRow(row as PostRow)));
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

