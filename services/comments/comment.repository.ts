import { mapCommentRow } from "@/lib/mappers/comment.mapper";
import { createClient } from "@/lib/supabase/server";
import type { CommentView } from "@/types/comment";

export async function fetchCommentsByPostId(
  postId: string,
  limit = 50,
): Promise<CommentView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      id,
      post_id,
      author_id,
      parent_id,
      content,
      created_at,
      author:profiles!comments_author_id_fkey (
        display_name,
        username,
        avatar_url
      )
    `,
    )
    .eq("post_id", postId)
    .is("parent_id", null)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[comment.repository] fetch:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapCommentRow(row));
}

export async function createCommentInDb(input: {
  postId: string;
  authorId: string;
  content: string;
}): Promise<{ error: string | null; comment?: CommentView }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: input.postId,
      author_id: input.authorId,
      content: input.content,
    })
    .select(
      `
      id,
      post_id,
      author_id,
      parent_id,
      content,
      created_at,
      author:profiles!comments_author_id_fkey (
        display_name,
        username,
        avatar_url
      )
    `,
    )
    .single();

  if (error || !data) return { error: error?.message ?? "Kommentar fehlgeschlagen" };

  const { count } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", input.postId);

  await supabase
    .from("posts")
    .update({ comment_count: count ?? 0 })
    .eq("id", input.postId);

  return { error: null, comment: mapCommentRow(data) };
}
