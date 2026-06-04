import type { Community, CommunityGroup, DiscoverGroup } from "@/types/community";

/** Leichte Discover-Gruppe ohne Engagement-N+1 */
export function mapGroupToDiscoverCard(
  community: Community,
  group: CommunityGroup,
): DiscoverGroup {
  return {
    ...group,
    communitySlug: community.slug,
    communityTitle: community.title,
    platformType: community.platformType,
    memberCount: group.memberCount ?? community.memberCount,
    bannerGradient: community.bannerGradient,
    isVerified: community.isVerified,
    isTrending: community.isTrending ?? false,
    category: community.category,
    rating: group.rating ?? 0,
    reviewCount: group.reviewCount ?? 0,
    isPremium: community.visibility === "premium",
    groupType: group.groupType ?? "group",
  };
}
