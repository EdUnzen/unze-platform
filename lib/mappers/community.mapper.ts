import { mapAccessConfigFromRow } from "@/lib/mappers/access.mapper";
import type { Community, CommunityGroup, DiscoverGroup } from "@/types/community";
import type { CommunityVisibility } from "@/types/community";
import type { CommunityRole, CommunityWithCreator } from "@/types/database";

export function mapCommunityRow(
  row: CommunityWithCreator,
  extras?: {
    membership?: { isMember: boolean; role: CommunityRole | null };
    isFollowing?: boolean;
    groupCount?: number;
  },
): Community {
  const creator = row.creator;
  const creatorName =
    creator?.display_name ??
    creator?.username ??
    "Unbekannt";

  const rowExt = row as CommunityWithCreator & {
    discover_enabled?: boolean;
    monetization_enabled?: boolean;
    external_url?: string | null;
    access_status?: string;
    admissions_paused?: boolean;
    member_limit?: number | null;
    join_approval_mode?: string;
    community_rules?: string | null;
    require_rules_consent?: boolean;
    require_age_verification?: boolean;
    min_age?: number | null;
    required_platform_ids?: unknown;
  };

  const access = mapAccessConfigFromRow(rowExt);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    bannerGradient: row.banner_gradient,
    platformType: row.platform_type,
    category: row.category,
    tags: row.tags ?? [],
    memberCount: row.member_count,
    rating: Number(row.rating_avg) || 0,
    reviewCount: row.review_count,
    isVerified: row.is_verified,
    isTrending: row.is_trending,
    visibility: row.visibility as CommunityVisibility,
    creatorName,
    creatorId: row.creator_id,
    creatorUsername: creator?.username ?? null,
    creatorAvatarUrl: creator?.avatar_url ?? null,
    creatorIsVerified: Boolean(creator?.is_verified),
    createdAt: row.created_at,
    externalUrl: rowExt.external_url ?? null,
    discoverEnabled: rowExt.discover_enabled ?? true,
    monetizationEnabled: rowExt.monetization_enabled ?? false,
    access,
    membership: extras?.membership,
    isFollowing: extras?.isFollowing,
    groupCount: extras?.groupCount,
  };
}

export function mapCommunityGroupRow(row: {
  id: string;
  community_id: string;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
  is_public: boolean;
}): CommunityGroup {
  return {
    id: row.id,
    communityId: row.community_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
    isPublic: row.is_public,
  };
}

type DiscoverGroupCommunityRow = {
  slug: string;
  title: string;
  platform_type: DiscoverGroup["platformType"];
  member_count: number;
  banner_gradient: string;
  is_verified: boolean;
  is_trending: boolean;
  discover_enabled: boolean;
  visibility: string;
  category: string;
  rating_avg: number | string;
  review_count: number;
  monetization_enabled?: boolean;
};

export function mapDiscoverGroupRow(row: {
  id: string;
  community_id: string;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
  is_public: boolean;
  community: DiscoverGroupCommunityRow | DiscoverGroupCommunityRow[] | null;
}): DiscoverGroup | null {
  const communityRaw = row.community;
  const community = Array.isArray(communityRaw)
    ? communityRaw[0]
    : communityRaw;

  if (!community) return null;

  const base = mapCommunityGroupRow(row);

  return {
    ...base,
    communitySlug: community.slug,
    communityTitle: community.title,
    platformType: community.platform_type,
    memberCount: community.member_count,
    bannerGradient: community.banner_gradient,
    isVerified: community.is_verified,
    isTrending: community.is_trending,
    category: community.category,
    rating: Number(community.rating_avg) || 0,
    reviewCount: community.review_count,
    isPremium: community.visibility === "premium",
  };
}
