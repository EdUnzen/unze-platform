import {
  fetchCommunityReviewsFromDb,
  fetchGroupReviewsFromDb,
  fetchReviewCommentsFromDb,
} from "./review.repository";
import type { ReviewCommentView, ReviewTarget } from "@/types/review";
import type { ReviewWithComments } from "@/types/review";

export async function getCommunityReviews(communityId: string) {
  const reviews = await fetchCommunityReviewsFromDb(communityId);
  return enrichReviewsWithComments(reviews, "community");
}

export async function getGroupReviews(groupId: string) {
  const reviews = await fetchGroupReviewsFromDb(groupId);
  return enrichReviewsWithComments(reviews, "group");
}

async function enrichReviewsWithComments(
  reviews: Awaited<ReturnType<typeof fetchCommunityReviewsFromDb>>,
  target: ReviewTarget,
) {
  return Promise.all(
    reviews.map(async (review) => ({
      review,
      comments: await fetchReviewCommentsFromDb(review.id, target),
    })),
  );
}

export type { ReviewWithComments };

export {
  insertCommunityReviewInDb,
  insertGroupReviewInDb,
  insertReviewCommentInDb,
  refreshRatingAggregate,
} from "./review.repository";
