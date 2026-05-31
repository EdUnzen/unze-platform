import type { CreatorNetworkReview } from "@/types/creator";
import { RatingSummary } from "@/components/ui/RatingSummary";
import { averageRatingFromValues, hasReviews } from "@/lib/utils/ratings";
import Link from "next/link";
import { Star } from "lucide-react";

interface CreatorReviewsSectionProps {
  reviews: CreatorNetworkReview[];
}

export function CreatorReviewsSection({ reviews }: CreatorReviewsSectionProps) {
  const count = reviews.length;
  const avg =
    count > 0 ? averageRatingFromValues(reviews.map((r) => r.rating)) : 0;

  return (
    <section className="mt-8 rounded-3xl bg-white p-4 shadow-card">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-unze-ink">Bewertungen</h2>
        {hasReviews(count) && (
          <RatingSummary rating={avg} reviewCount={count} />
        )}
      </header>

      {count === 0 ? (
        <p className="text-sm text-unze-ink-secondary">
          Noch keine Bewertungen für die Communities und Gruppen dieses Creators.
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => {
            const href =
              review.target === "community"
                ? `/community/${review.communitySlug}`
                : `/community/${review.communitySlug}/group/${review.targetSlug}`;

            return (
              <li
                key={`${review.target}-${review.id}`}
                className="rounded-2xl border border-unze-border/80 p-3"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <Link href={href} className="text-sm font-semibold text-unze-green">
                    {review.targetTitle}
                  </Link>
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {review.rating}
                  </span>
                </div>
                <p className="text-xs text-unze-ink-muted">
                  {review.authorName} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString("de-DE")}
                </p>
                {review.title && (
                  <p className="mt-1 text-sm font-medium text-unze-ink">{review.title}</p>
                )}
                <p className="mt-1 line-clamp-3 text-sm text-unze-ink-secondary">
                  {review.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
