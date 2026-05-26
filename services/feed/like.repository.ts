import { createClient } from "@/lib/supabase/server";

export async function fetchViewerLikedPostIds(
  postIds: string[],
  userId: string | null,
): Promise<Set<string>> {
  if (!userId || postIds.length === 0) return new Set();

  const supabase = await createClient();
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", postIds);

  if (error) {
    console.error("[like.repository] fetch:", error.message);
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.post_id as string));
}

export async function togglePostLikeInDb(
  postId: string,
  userId: string,
): Promise<{ error: string | null; liked: boolean; likeCount: number }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert", liked: false, likeCount: 0 };

  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) return { error: error.message, liked: false, likeCount: 0 };
  } else {
    const { error } = await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: userId,
    });
    if (error) return { error: error.message, liked: false, likeCount: 0 };
  }

  const { count } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  const likeCount = count ?? 0;
  await supabase.from("posts").update({ like_count: likeCount }).eq("id", postId);

  return { error: null, liked: !existing, likeCount };
}
