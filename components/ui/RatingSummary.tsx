import { cn } from "@/lib/utils/cn";
import { hasReviews } from "@/lib/utils/ratings";
import { Star } from "lucide-react";

interface RatingSummaryProps {
  rating: number;
  reviewCount: number;
  className?: string;
  starClassName?: string;
  showCount?: boolean;
  /** Immer anzeigen, z. B. ⭐ 0,0 (0 Bewertungen) */
  alwaysShow?: boolean;
  /** Helle Schrift auf Banner */
  onDark?: boolean;
}

export function RatingSummary({
  rating,
  reviewCount,
  className,
  starClassName = "h-4 w-4",
  showCount = true,
  alwaysShow = false,
  onDark = false,
}: RatingSummaryProps) {
  if (!alwaysShow && !hasReviews(reviewCount)) return null;

  const displayRating =
    reviewCount > 0 ? Number(rating).toFixed(1).replace(".", ",") : "0,0";
  const countLabel =
    reviewCount === 0
      ? "Noch keine Bewertungen"
      : reviewCount === 1
        ? "1 Bewertung"
        : `${reviewCount} Bewertungen`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        onDark ? "text-white/95" : "text-unze-ink-secondary",
        className,
      )}
    >
      <Star
        className={cn(
          onDark ? "fill-amber-300 text-amber-300" : "fill-amber-400 text-amber-400",
          starClassName,
        )}
        aria-hidden
      />
      <span>{displayRating}</span>
      {showCount && (
        <span
          className={cn(
            "text-xs font-normal",
            onDark ? "text-white/80" : "text-unze-ink-muted",
          )}
        >
          ({countLabel})
        </span>
      )}
    </span>
  );
}
