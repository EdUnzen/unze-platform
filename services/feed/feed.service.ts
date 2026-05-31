import { isFeedEnabled } from "@/lib/features/platform-features";
import {
  mapPostRow,
  type FeedPost,
  type FeedPostAuthor,
  type FeedPostCommunity,
  type FeedPostGroup,
} from "@/lib/mappers/post.mapper";
import { createClient } from "@/lib/supabase/server";
import type { CommunityRole, PostRow } from "@/types/database";
import type { PlatformType } from "@/types/community";
import { getFollowedCommunityIds } from "@/services/follow/follow.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { fetchViewerLikedPostIds } from "./like.repository";
import {
  FEED_EXPLORE_RATIO,
  interleaveFeedPosts,
} from "@/lib/feed/blend-feed";
import type { PostMediaItem, PostMetadata } from "@/types/post";
import type { PostType } from "@/types/database";

export async function getFeedAuthorMeta(
  authorIds: string[],
): Promise<Record<string, FeedPostAuthor>> {
  const unique = [...new Set(authorIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, is_verified")
    .in("id", unique);

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((row) => [
      row.id as string,
      {
        id: row.id as string,
        name: (row.display_name as string) ?? (row.username as string) ?? "Mitglied",
        username: (row.username as string) ?? null,
        avatarUrl: (row.avatar_url as string) ?? null,
        isVerified: Boolean(row.is_verified),
      },
    ]),
  );
}

async function getFeedAuthorCommunityRoles(
  pairs: { authorId: string; communityId: string }[],
): Promise<Record<string, CommunityRole>> {
  const unique = pairs.filter((p) => p.authorId && p.communityId);
  if (unique.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const communityIds = [...new Set(unique.map((p) => p.communityId))];
  const authorIds = [...new Set(unique.map((p) => p.authorId))];

  const { data } = await supabase
    .from("community_members")
    .select("user_id, community_id, role")
    .in("community_id", communityIds)
    .in("user_id", authorIds);

  const result: Record<string, CommunityRole> = {};
  for (const row of data ?? []) {
    const key = `${row.user_id as string}:${row.community_id as string}`;
    result[key] = row.role as CommunityRole;
  }
  return result;
}

export async function enrichFeedPosts(posts: FeedPost[]): Promise<FeedPost[]> {
  if (posts.length === 0) return posts;

  const authorIds = posts.map((p) => p.authorId);
  const communityIds = posts
    .map((p) => p.communityId)
    .filter((id): id is string => Boolean(id));
  const groupIds = posts.map((p) => p.groupId).filter((id): id is string => Boolean(id));
  const postIds = posts.map((p) => p.id);

  const rolePairs = posts
    .filter((p) => p.communityId)
    .map((p) => ({ authorId: p.authorId, communityId: p.communityId! }));

  const user = await getCurrentUser();
  const [authors, communityMeta, groupMeta, roles, likedIds] = await Promise.all([
    getFeedAuthorMeta(authorIds),
    getFeedCommunityMeta(communityIds),
    getFeedGroupMeta(groupIds),
    getFeedAuthorCommunityRoles(rolePairs),
    fetchViewerLikedPostIds(postIds, user?.id ?? null),
  ]);

  return posts.map((post) => {
    const roleKey =
      post.communityId ? `${post.authorId}:${post.communityId}` : null;
    const author = authors[post.authorId];
    const community =
      post.communityId && communityMeta[post.communityId]
        ? communityMeta[post.communityId]
        : post.community;
    const group =
      post.groupId && groupMeta[post.groupId] ? groupMeta[post.groupId] : post.group;

    return {
      ...post,
      author: author
        ? {
            ...author,
            communityRole: roleKey ? roles[roleKey] ?? null : null,
          }
        : post.author,
      community,
      group,
      isLikedByViewer: likedIds.has(post.id),
    };
  });
}

export async function getPostById(postId: string): Promise<FeedPost | null> {
  if (!isFeedEnabled()) return null;
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
  if (!isFeedEnabled()) return [];
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
): Promise<Record<string, FeedPostCommunity>> {
  const unique = [...new Set(communityIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("communities")
    .select("id, title, slug, platform_type, is_verified, is_trending")
    .in("id", unique);

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((row) => [
      row.id as string,
      {
        id: row.id as string,
        title: row.title as string,
        slug: row.slug as string,
        platformType: row.platform_type as PlatformType,
        isVerified: Boolean(row.is_verified),
        isTrending: Boolean(row.is_trending),
      },
    ]),
  );
}

export async function getFeedGroupMeta(
  groupIds: string[],
): Promise<Record<string, FeedPostGroup>> {
  const unique = [...new Set(groupIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("community_groups")
    .select("id, title, slug")
    .in("id", unique);

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((row) => [
      row.id as string,
      {
        id: row.id as string,
        title: row.title as string,
        slug: row.slug as string,
      },
    ]),
  );
}

export async function getPersonalFeedPosts(limit = 20): Promise<FeedPost[]> {
  if (!isFeedEnabled()) return [];
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

async function fetchFollowFeedPosts(
  limit: number,
  options?: { followedCommunityIds?: string[]; userId?: string | null },
): Promise<FeedPost[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const followedCommunityIds =
    options?.followedCommunityIds ?? (await getFollowedCommunityIds());
  const userId =
    options?.userId !== undefined
      ? options.userId
      : (await supabase.auth.getUser()).data.user?.id ?? null;

  if (!userId && followedCommunityIds.length === 0) {
    return [];
  }

  const filters: string[] = [];
  if (userId) filters.push(`author_id.eq.${userId}`);
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
    fetchFollowFeedPosts(followCount, {
      followedCommunityIds: followedIds,
      userId: user?.id ?? null,
    }),
    fetchExploreFeedPosts(exploreCount + 4, followedIds),
  ]);

  const blended = interleaveFeedPosts(followPosts, explorePosts, limit);
  return enrichFeedPosts(blended);
}

export async function getCommunityPosts(
  communityId: string,
  limit = 20,
): Promise<FeedPost[]> {
  if (!isFeedEnabled()) return [];
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
  groupId?: string;
  visibility?: "public" | "followers" | "community" | "private";
  postType?: PostType;
  media?: PostMediaItem[];
  metadata?: PostMetadata;
}) {
  if (!isFeedEnabled()) {
    return { data: null, error: new Error("Feed ist deaktiviert") };
  }
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase nicht konfiguriert") };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Nicht angemeldet") };

  const payload: Record<string, unknown> = {
    author_id: user.id,
    content: input.content,
    title: input.title ?? null,
    community_id: input.communityId ?? null,
    group_id: input.groupId ?? null,
    visibility: input.visibility ?? (input.communityId ? "public" : "public"),
    post_type: input.postType ?? "text",
    media: input.media ?? [],
    metadata: input.metadata ?? {},
  };

  return supabase.from("posts").insert(payload).select().single();
}
