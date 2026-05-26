import type { CommentView } from "@/types/comment";

export function mapCommentRow(row: {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  author?:
    | {
        display_name: string | null;
        username: string | null;
        avatar_url: string | null;
      }
    | {
        display_name: string | null;
        username: string | null;
        avatar_url: string | null;
      }[]
    | null;
}): CommentView {
  const authorRaw = row.author;
  const author = Array.isArray(authorRaw) ? authorRaw[0] : authorRaw;

  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    parentId: row.parent_id,
    content: row.content,
    createdAt: row.created_at,
    authorName:
      author?.display_name ?? author?.username ?? "Mitglied",
    authorUsername: author?.username ?? null,
    authorAvatarUrl: author?.avatar_url ?? null,
  };
}
