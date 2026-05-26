import { mapPostRow, type FeedPost, type FeedPostAuthor } from "@/lib/mappers/post.mapper";
import { createClient } from "@/lib/supabase/server";
import type { PostRow } from "@/types/database";
import { getFollowedCommunityIds } from "@/services/follow/follow.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { fetchViewerLikedPostIds } from "./like.repository";
import {
  FEED_EXPLORE_RATIO,
  interleaveFeedPosts,
} from "@/lib/feed/blend-feed";
import { getCommunityActivityStats } from "@/services/platform/activity-stats.service";

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
  return getBlendedFeedPosts(limit);
}

async function fetchExploreFeedPosts(
  limit: number,
  excludeCommunityIds: string[] = [],
): Promise<FeedPost[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("posts")
    .select("*")
    .eq("visibility", "public")
    .order("like_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  if (excludeCommunityIds.length > 0) {
    query = query.not(
      "community_id",
      "in",
      `(${excludeCommunityIds.join(",")})`,
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("[feed.service] explore:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...mapPostRow(row as PostRow),
    feedSource: "explore" as const,
  }));
}

async function fetchFollowFeedPosts(limit: number): Promise<FeedPost[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const followedCommunityIds = await getFollowedCommunityIds();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && followedCommunityIds.length === 0) {
    return [];
  }

  const filters: string[] = [];
  if (user) filters.push(`author_id.eq.${user.id}`);
  if (followedCommunityIds.length > 0) {
    filters.push(`community_id.in.(${followedCommunityIds.join(",")})`);
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .or(filters.join(","))
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[feed.service] follow:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...mapPostRow(row as PostRow),
    feedSource: "follow" as const,
  }));
}

/** Follow (~88 %) + Explore (~12 %) */
export async function getBlendedFeedPosts(limit = 20): Promise<FeedPost[]> {
  const exploreCount = Math.max(1, Math.round(limit * FEED_EXPLORE_RATIO));
  const followCount = limit - exploreCount + 4;

  const followedIds = await getFollowedCommunityIds();
  const user = await getCurrentUser();

  if (!user && followedIds.length === 0) {
    return getDiscoverFeedPosts(limit);
  }

  const [followPosts, explorePosts] = await Promise.all([
    fetchFollowFeedPosts(followCount),
    fetchExploreFeedPosts(exploreCount + 4, followedIds),
  ]);

  const blended = interleaveFeedPosts(followPosts, explorePosts, limit);
  return enrichFeedPosts(blended);
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

