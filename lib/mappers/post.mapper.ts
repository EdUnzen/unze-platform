import type { PostRow, CommunityRole } from "@/types/database";
import type { PlatformType } from "@/types/community";
import type { PostMediaItem, PostMetadata } from "@/types/post";

export interface FeedPostAuthor {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  isVerified?: boolean;
  communityRole?: CommunityRole | null;
}

export interface FeedPostCommunity {
  id: string;
  title: string;
  slug: string;
  platformType: PlatformType;
  isVerified: boolean;
  isTrending?: boolean;
}

export interface FeedPostGroup {
  id: string;
  title: string;
  slug: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  communityId: string | null;
  groupId: string | null;
  postType: PostRow["post_type"];
  title: string | null;
  content: string;
  visibility: PostRow["visibility"];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  shareCount: number;
  media: PostMediaItem[];
  metadata: PostMetadata;
  createdAt: string;
  isPinned?: boolean;
  author?: FeedPostAuthor;
  community?: FeedPostCommunity;
  group?: FeedPostGroup;
  isLikedByViewer?: boolean;
  /** follow = aus Abos, explore = Discover-Mix */
  feedSource?: "follow" | "explore";
}

function parseMedia(raw: unknown): PostMediaItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is PostMediaItem =>
      Boolean(item) &&
      typeof item === "object" &&
      "url" in item &&
      typeof (item as PostMediaItem).url === "string",
  );
}

function parseMetadata(raw: unknown): PostMetadata {
  if (!raw || typeof raw !== "object") return {};
  return raw as PostMetadata;
}

export function mapPostRow(row: PostRow): FeedPost {
  return {
    id: row.id,
    authorId: row.author_id,
    communityId: row.community_id,
    groupId: row.group_id ?? null,
    postType: row.post_type,
    title: row.title,
    content: row.content,
    visibility: row.visibility,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    viewCount: row.view_count ?? 0,
    shareCount: row.share_count ?? 0,
    media: parseMedia(row.media),
    metadata: parseMetadata(row.metadata),
    createdAt: row.created_at,
    isPinned: row.is_pinned ?? false,
  };
}
