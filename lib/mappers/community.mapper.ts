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
    view_count_total?: number;
    view_count_weekly?: number;
    share_count?: number;
  };

  const access = mapAccessConfigFromRow(rowExt);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    bannerGradient: row.banner_gradient,
    bannerUrl: row.banner_url ?? null,
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
    viewCount: rowExt.view_count_total ?? undefined,
    viewCountWeekly: rowExt.view_count_weekly ?? undefined,
    shareCount: rowExt.share_count ?? undefined,
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
  group_type?: string;
  cover_url?: string | null;
  price_cents?: number | null;
  currency?: string;
  rating_avg?: number | string;
  review_count?: number;
  member_count?: number;
  view_count_weekly?: number;
  share_count?: number;
}): CommunityGroup {
  return {
    id: row.id,
    communityId: row.community_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
    isPublic: row.is_public,
    groupType: (row.group_type as CommunityGroup["groupType"]) ?? "group",
    coverUrl: row.cover_url ?? null,
    priceCents: row.price_cents ?? null,
    currency: row.currency ?? "eur",
    rating: Number(row.rating_avg) || 0,
    reviewCount: row.review_count ?? 0,
    memberCount: row.member_count ?? 0,
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
  view_count_weekly?: number;
  share_count?: number;
  community: DiscoverGroupCommunityRow | DiscoverGroupCommunityRow[] | null;
}): DiscoverGroup | null {
  const communityRaw = row.community;
  const community = Array.isArray(communityRaw)
    ? communityRaw[0]
    : communityRaw;

  if (!community) return null;

  const base = mapCommunityGroupRow(row);

  const groupRating = Number((row as { rating_avg?: number | string }).rating_avg);
  const groupReviewCount = (row as { review_count?: number }).review_count;

  return {
    ...base,
    communitySlug: community.slug,
    communityTitle: community.title,
    platformType: community.platform_type,
    memberCount: base.memberCount ?? community.member_count,
    bannerGradient: community.banner_gradient,
    isVerified: community.is_verified,
    isTrending: community.is_trending,
    category: community.category,
    rating: groupRating > 0 ? groupRating : Number(community.rating_avg) || 0,
    reviewCount: groupReviewCount && groupReviewCount > 0 ? groupReviewCount : community.review_count,
    isPremium: community.visibility === "premium",
    viewCountWeekly: row.view_count_weekly ?? undefined,
    shareCount: row.share_count ?? undefined,
  };
}
