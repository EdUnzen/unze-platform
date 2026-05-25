import type { PostRow } from "@/types/database";

export interface FeedPost {
  id: string;
  authorId: string;
  communityId: string | null;
  postType: PostRow["post_type"];
  title: string | null;
  content: string;
  visibility: PostRow["visibility"];
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export function mapPostRow(row: PostRow): FeedPost {
  return {
    id: row.id,
    authorId: row.author_id,
    communityId: row.community_id,
    postType: row.post_type,
    title: row.title,
    content: row.content,
    visibility: row.visibility,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
  };
}
