import { REVIEWS_COMING_SOON_MESSAGE } from "@/types/review";
import type { Community } from "@/types/community";
import { Star } from "lucide-react";

interface CommunityReviewsPrepProps {
  community: Community;
}

export function CommunityReviewsPrep({ community }: CommunityReviewsPrepProps) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-unze-ink">Bewertungen</h2>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-unze-ink">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
          {community.rating}
          <span className="text-xs font-normal text-unze-ink-muted">
            ({community.reviewCount})
          </span>
        </span>
      </div>
      <p className="text-xs leading-relaxed text-unze-ink-secondary">
        {REVIEWS_COMING_SOON_MESSAGE}
      </p>
    </section>
  );
}
