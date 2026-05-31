import { hasReviews } from "@/lib/utils/ratings";
import { cn } from "@/lib/utils/cn";
import { Star } from "lucide-react";

interface RatingSummaryProps {
  rating: number;
  reviewCount: number;
  className?: string;
  starClassName?: string;
  showCount?: boolean;
}

/** Stern + Durchschnitt — nur wenn reviewCount > 0. */
export function RatingSummary({
  rating,
  reviewCount,
  className,
  starClassName = "h-4 w-4",
  showCount = true,
}: RatingSummaryProps) {
  if (!hasReviews(reviewCount)) return null;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star
        className={cn("fill-amber-400 text-amber-400", starClassName)}
        aria-hidden
      />
      <span>{rating}</span>
      {showCount && (
        <span className="text-xs font-normal text-unze-ink-muted">
          ({reviewCount})
        </span>
      )}
    </span>
  );
}
