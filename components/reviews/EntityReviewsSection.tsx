import { EntityReviewsPanel } from "@/components/reviews/EntityReviewsPanel";
import { averageRatingFromValues } from "@/lib/utils/ratings";
import { getCommunityReviews, getGroupReviews } from "@/services/reviews/review.service";
import type { EntityReviewContext } from "@/types/review";

interface EntityReviewsSectionProps {
  context: EntityReviewContext;
  isLoggedIn: boolean;
}

export async function EntityReviewsSection({
  context,
  isLoggedIn,
}: EntityReviewsSectionProps) {
  const items =
    context.target === "community"
      ? await getCommunityReviews(context.targetId)
      : await getGroupReviews(context.targetId);

  const reviewCount = items.length;
  const rating =
    reviewCount > 0
      ? averageRatingFromValues(items.map(({ review }) => review.rating))
      : 0;

  return (
    <EntityReviewsPanel
      context={{
        ...context,
        rating,
        reviewCount,
      }}
      items={items}
      isLoggedIn={isLoggedIn}
    />
  );
}
