import { SocialProofBar } from "@/components/social/SocialProofBar";
import { formatMemberCount } from "@/services/community/community.service";
import { formatWeeklyActivityLabel } from "@/services/platform/activity-stats.service";
import type { Community } from "@/types/community";
import { FileText, MessageSquare, Star, Users } from "lucide-react";

interface CommunitySocialProofProps {
  community: Community;
  weeklyPostCount?: number;
  totalPostCount?: number;
}

export function CommunitySocialProof({
  community,
  weeklyPostCount = 0,
  totalPostCount,
}: CommunitySocialProofProps) {
  const activityLabel = formatWeeklyActivityLabel(weeklyPostCount);

  return (
    <SocialProofBar
      items={[
        {
          icon: Users,
          label: `${formatMemberCount(community.memberCount)} Mitglieder`,
        },
        {
          icon: Star,
          label: `${community.rating} · ${community.reviewCount} Bewertungen`,
        },
        ...(activityLabel
          ? [{ icon: FileText, label: activityLabel, highlight: true }]
          : []),
        ...(totalPostCount && totalPostCount > 0
          ? [{ icon: MessageSquare, label: `${totalPostCount} Beiträge gesamt` }]
          : []),
      ]}
    />
  );
}
