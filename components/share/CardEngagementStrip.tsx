import { buildEngagementPills } from "@/lib/engagement/build-pills";
import { cn } from "@/lib/utils/cn";
import type { CardEngagementMetrics } from "@/types/engagement";
import { TrendingUp } from "lucide-react";

interface CardEngagementStripProps {
  metrics?: CardEngagementMetrics;
  className?: string;
  max?: number;
}

export function CardEngagementStrip({
  metrics,
  className,
  max = 2,
}: CardEngagementStripProps) {
  if (!metrics) return null;

  const pills = buildEngagementPills(metrics, max);
  if (pills.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {pills.map((pill) => (
        <span
          key={pill.key}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            pill.highlight
              ? "bg-unze-green-muted/70 text-unze-green-dark"
              : "bg-unze-surface-muted text-unze-ink-secondary",
          )}
        >
          {pill.key === "trending" && (
            <TrendingUp className="h-3 w-3" aria-hidden />
          )}
          {pill.label}
        </span>
      ))}
    </div>
  );
}
