import type { CardEngagementMetrics, EngagementPill } from "@/types/engagement";
import {
  formatNetworkFollowLabel,
  formatShareCountLabel,
  formatWeeklyViewsLabel,
} from "@/lib/utils/format-metrics";

/** Max. 2 Pills — priorisiert, nicht überladen */
export function buildEngagementPills(
  metrics: CardEngagementMetrics,
  max = 2,
): EngagementPill[] {
  const pills: EngagementPill[] = [];

  if (metrics.isTrending) {
    pills.push({ key: "trending", label: "Trending", highlight: true });
  }

  if ((metrics.weeklyViews ?? 0) >= 500) {
    pills.push({
      key: "views",
      label: formatWeeklyViewsLabel(metrics.weeklyViews!),
    });
  }

  if ((metrics.shareCount ?? 0) >= 20) {
    pills.push({
      key: "shares",
      label: formatShareCountLabel(metrics.shareCount!),
    });
  }

  if ((metrics.networkFollowCount ?? 0) >= 1) {
    pills.push({
      key: "network",
      label: formatNetworkFollowLabel(metrics.networkFollowCount!),
      highlight: true,
    });
  }

  if (metrics.activityLabel && pills.length < max) {
    pills.push({
      key: "activity",
      label: metrics.activityLabel,
    });
  }

  return pills.slice(0, max);
}
