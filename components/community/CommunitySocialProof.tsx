import { hasReviews } from "@/lib/utils/ratings";
import { SocialProofBar } from "@/components/social/SocialProofBar";
import { isFeedEnabled } from "@/lib/features/platform-features";
import { formatMemberCount } from "@/lib/utils/format-metrics";
import {
  formatWeeklyActivityLabel,
  formatWeeklyEventLabel,
} from "@/services/platform/activity-stats.service";
import type { Community } from "@/types/community";
import { Calendar, FileText, Star, Users } from "lucide-react";

interface CommunitySocialProofProps {
  community: Community;
  weeklyPostCount?: number;
  totalPostCount?: number;
  weeklyEventCount?: number;
}

export function CommunitySocialProof({
  community,
  weeklyPostCount = 0,
  totalPostCount,
  weeklyEventCount = 0,
}: CommunitySocialProofProps) {
  const activityLabel = isFeedEnabled()
    ? formatWeeklyActivityLabel(weeklyPostCount)
    : formatWeeklyEventLabel(weeklyEventCount);

  const items = [
    {
      icon: Users,
      label: `${formatMemberCount(community.memberCount)} Mitglieder`,
    },
    ...(hasReviews(community.reviewCount)
      ? [
          {
            icon: Star,
            label: `${community.rating} · ${community.reviewCount} Bewertungen`,
          },
        ]
      : []),
    ...(activityLabel
      ? [{ icon: isFeedEnabled() ? FileText : Calendar, label: activityLabel, highlight: true }]
      : []),
    ...(isFeedEnabled() && totalPostCount && totalPostCount > 0
      ? [{ icon: FileText, label: `${totalPostCount} Beiträge gesamt` }]
      : []),
  ];

  return (
    <SocialProofBar
      items={items}
    />
  );
}
