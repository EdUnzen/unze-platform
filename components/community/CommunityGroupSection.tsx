import { CommunityGroupCardList } from "@/components/community/CommunityGroupCardList";
import { getGroupVisual } from "@/lib/demo/group-visuals";
import { buildGroupCardEngagement } from "@/services/engagement/engagement.service";
import type { Community, CommunityGroup, DiscoverGroup } from "@/types/community";

interface CommunityGroupSectionProps {
  community: Community;
  groups: CommunityGroup[];
}

export async function CommunityGroupSection({
  community,
  groups,
}: CommunityGroupSectionProps) {
  if (groups.length === 0) return null;

  const discoverGroups: DiscoverGroup[] = await Promise.all(
    groups.map(async (group) => {
      const visual = getGroupVisual(community.slug, group.slug);
      const engagement = await buildGroupCardEngagement({
        communitySlug: community.slug,
        groupSlug: group.slug,
        isTrending: community.isTrending,
        activityLabel: visual?.activityLabel,
      });

      return {
        ...group,
        communitySlug: community.slug,
        communityTitle: community.title,
        platformType: community.platformType,
        memberCount: community.memberCount,
        bannerGradient: community.bannerGradient,
        isVerified: community.isVerified,
        isTrending: community.isTrending ?? false,
        category: community.category,
        rating: community.rating,
        reviewCount: community.reviewCount,
        isPremium: community.visibility === "premium",
        engagement,
      };
    }),
  );

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-unze-ink">Gruppen & Bereiche</h2>
        <p className="text-xs text-unze-ink-secondary">
          Untergruppen mit eigenem Fokus — wie kleine Community-Bereiche
        </p>
      </header>
      <CommunityGroupCardList groups={discoverGroups} layout="vertical" />
    </section>
  );
}
