import {
  fetchCommunityReviewsFromDb,
  fetchGroupReviewsFromDb,
  fetchReviewCommentsBatchFromDb,
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
  const commentMap = await fetchReviewCommentsBatchFromDb(
    reviews.map((review) => review.id),
    target,
  );

  return reviews.map((review) => ({
    review,
    comments: commentMap.get(review.id) ?? [],
  }));
}

export type { ReviewWithComments };

export {
  insertCommunityReviewInDb,
  insertGroupReviewInDb,
  insertReviewCommentInDb,
  refreshRatingAggregate,
} from "./review.repository";
