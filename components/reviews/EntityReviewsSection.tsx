import { EntityReviewsPanel } from "@/components/reviews/EntityReviewsPanel";
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

  return (
    <EntityReviewsPanel
      context={context}
      items={items}
      isLoggedIn={isLoggedIn}
    />
  );
}
