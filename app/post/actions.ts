"use server";

import { revalidateDiscover } from "@/lib/cache/revalidate-discover";
import { createPostComment } from "@/services/comments/comment.service";
import { togglePostLike } from "@/services/feed/like.service";
import { revalidatePath } from "next/cache";

export async function togglePostLikeAction(postId: string) {
  const result = await togglePostLike(postId);
  revalidatePath(`/post/${postId}`);
  revalidateDiscover();
  revalidatePath("/");
  return result;
}

export async function createCommentAction(
  postId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const content = String(formData.get("content") ?? "");
  const result = await createPostComment({ postId, content });

  if (result.error) return { error: result.error };

  revalidatePath(`/post/${postId}`);
  revalidateDiscover();
  return {};
}
