import type { CardEngagementMetrics, EngagementPill } from "@/types/engagement";

/** Max. 2 Pills — ohne öffentliche Aufrufe/Shares */
export function buildEngagementPills(
  metrics: CardEngagementMetrics,
  max = 2,
): EngagementPill[] {
  const pills: EngagementPill[] = [];

  if (metrics.isTrending) {
    pills.push({ key: "trending", label: "Beliebt", highlight: true });
  }

  if ((metrics.networkFollowCount ?? 0) >= 1) {
    pills.push({
      key: "network",
      label:
        metrics.networkFollowCount === 1
          ? "1 Kontakt folgt"
          : `${metrics.networkFollowCount} Kontakte folgen`,
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
