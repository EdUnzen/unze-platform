import { getCurrentUser } from "@/services/auth/auth.service";
import {
  createCommentInDb,
  fetchCommentsByPostId,
} from "./comment.repository";

export async function getPostComments(postId: string) {
  return fetchCommentsByPostId(postId);
}

export async function createPostComment(input: {
  postId: string;
  content: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" as const, comment: null };

  const trimmed = input.content.trim();
  if (!trimmed) return { error: "Kommentar darf nicht leer sein" as const, comment: null };

  return createCommentInDb({
    postId: input.postId,
    authorId: user.id,
    content: trimmed,
  });
}
