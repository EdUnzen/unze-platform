import { mapAccessConfigFromRow } from "@/lib/mappers/access.mapper";
import type { Community, CommunityGroup } from "@/types/community";
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
