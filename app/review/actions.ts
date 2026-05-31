"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import {
  insertCommunityReviewInDb,
  insertGroupReviewInDb,
  insertReviewCommentInDb,
  refreshRatingAggregate,
} from "@/services/reviews/review.service";
import type { ReviewTarget } from "@/types/review";
import { revalidatePath } from "next/cache";

function parseRating(raw: FormDataEntryValue | null): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return Math.round(n);
}

export async function submitReviewAction(
  target: ReviewTarget,
  targetId: string,
  returnPath: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Anmelden erforderlich" };

  const rating = parseRating(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!rating) return { error: "Bewertung (1–5) erforderlich" };
  if (body.length < 10) return { error: "Mindestens 10 Zeichen für die Bewertung" };

  const result =
    target === "community"
      ? await insertCommunityReviewInDb({
          communityId: targetId,
          authorId: user.id,
          rating,
          title: title || undefined,
          body,
        })
      : await insertGroupReviewInDb({
          groupId: targetId,
          authorId: user.id,
          rating,
          title: title || undefined,
          body,
        });

  if (result.error) return { error: result.error };

  await refreshRatingAggregate(target, targetId);
  revalidatePath(returnPath);
  return {};
}

export async function submitReviewCommentAction(
  reviewId: string,
  reviewTarget: ReviewTarget,
  returnPath: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Anmelden erforderlich" };

  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 2) return { error: "Kommentar zu kurz" };

  const result = await insertReviewCommentInDb({
    reviewId,
    reviewTarget,
    authorId: user.id,
    body,
  });

  if (result.error) return { error: result.error };

  revalidatePath(returnPath);
  return {};
}
