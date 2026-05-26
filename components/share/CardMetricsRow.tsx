import type { CardEngagementMetrics } from "@/types/engagement";
import {
  formatShareCountLabel,
  formatWeeklyViewsLabel,
  formatCompactCount,
} from "@/lib/utils/format-metrics";
import { cn } from "@/lib/utils/cn";
import { Eye, Share2 } from "lucide-react";

interface CardMetricsRowProps {
  metrics?: CardEngagementMetrics;
  weeklyViews?: number;
  shareCount?: number;
  className?: string;
  compact?: boolean;
}

export function CardMetricsRow({
  metrics,
  weeklyViews,
  shareCount,
  className,
  compact = false,
}: CardMetricsRowProps) {
  const views = weeklyViews ?? metrics?.weeklyViews;
  const shares = shareCount ?? metrics?.shareCount;

  if ((!views || views <= 0) && (!shares || shares <= 0)) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 text-[11px] text-unze-ink-muted",
        className,
      )}
    >
      {views !== undefined && views > 0 && (
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" aria-hidden />
          {compact
            ? formatCompactCount(views)
            : formatWeeklyViewsLabel(views).replace(" diese Woche", "")}
        </span>
      )}
      {shares !== undefined && shares > 0 && (
        <span className="inline-flex items-center gap-1 font-medium text-unze-ink-secondary">
          <Share2 className="h-3 w-3" aria-hidden />
          {compact
            ? `${formatCompactCount(shares)}×`
            : formatShareCountLabel(shares)}
        </span>
      )}
    </div>
  );
}
