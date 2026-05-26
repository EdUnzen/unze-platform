import { getCurrentUser } from "@/services/auth/auth.service";
import {
  fetchViewerLikedPostIds,
  togglePostLikeInDb,
} from "./like.repository";

export async function getViewerLikedPostIds(postIds: string[]) {
  const user = await getCurrentUser();
  return fetchViewerLikedPostIds(postIds, user?.id ?? null);
}

export async function togglePostLike(postId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" as const, liked: false, likeCount: 0 };

  return togglePostLikeInDb(postId, user.id);
}
