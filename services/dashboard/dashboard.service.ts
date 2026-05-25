import { mapCommunityRow } from "@/lib/mappers/community.mapper";
import { hasCommunityPermission } from "@/lib/permissions/community.permissions";
import { createClient } from "@/lib/supabase/server";
import type { ManagedCommunity, CommunityDashboardStats } from "@/types/dashboard";
import type { CommunityRole, CommunityWithCreator } from "@/types/database";
import { countPendingApplicationsFromDb } from "@/services/access/access.repository";
import { countGroupsByCommunityId } from "@/services/community/group.repository";
import { fetchBadgesByCommunity } from "@/services/badges/badge.repository";

const COMMUNITY_SELECT = `
  *,
  creator:profiles!communities_creator_id_fkey (
    id,
    display_name,
    username,
    avatar_url,
    is_verified
  )
`;

const MANAGER_ROLES: CommunityRole[] = ["creator", "admin", "moderator"];

async function fetchCommunityStats(
  communityId: string,
  memberCount: number,
): Promise<CommunityDashboardStats> {
  const supabase = await createClient();
  const groupCount = await countGroupsByCommunityId(communityId);
  const badges = await fetchBadgesByCommunity(communityId);

  let postCount = 0;
  let followerCount = 0;

  if (supabase) {
    const { count: posts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId);

    const { count: followers } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("target_type", "community")
      .eq("target_community_id", communityId);

    postCount = posts ?? 0;
    followerCount = followers ?? 0;
  }

  return {
    memberCount,
    groupCount,
    postCount,
    followerCount,
    badgeCount: badges.length,
  };
}

export async function getManagedCommunities(
  userId: string,
): Promise<ManagedCommunity[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_members")
    .select(
      `
      role,
      community:communities (${COMMUNITY_SELECT})
    `,
    )
    .eq("user_id", userId)
    .in("role", MANAGER_ROLES);

  if (error || !data) {
    console.error("[dashboard.service] managed:", error?.message);
    return [];
  }

  const results: ManagedCommunity[] = [];

  for (const row of data) {
    const rawCommunity = row.community as CommunityWithCreator | CommunityWithCreator[] | null;
    const community = Array.isArray(rawCommunity) ? rawCommunity[0] : rawCommunity;
    if (!community) continue;

    const stats = await fetchCommunityStats(
      community.id,
      community.member_count,
    );

    const pendingApplicationCount = await countPendingApplicationsFromDb(
      community.id,
    );

    results.push({
      ...mapCommunityRow(community),
      viewerRole: row.role as CommunityRole,
      stats,
      pendingApplicationCount,
    });
  }

  return results;
}

export async function getDashboardCommunityAccess(
  slug: string,
  userId: string,
): Promise<{
  community: ManagedCommunity | null;
  canAccess: boolean;
}> {
  const supabase = await createClient();
  if (!supabase) return { community: null, canAccess: false };

  const { data: communityRow } = await supabase
    .from("communities")
    .select(COMMUNITY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (!communityRow) return { community: null, canAccess: false };

  const { data: membership } = await supabase
    .from("community_members")
    .select("role")
    .eq("community_id", communityRow.id)
    .eq("user_id", userId)
    .maybeSingle();

  const role = (membership?.role as CommunityRole) ?? null;
  const canAccess =
    Boolean(role) &&
    (hasCommunityPermission(role, "moderate") ||
      hasCommunityPermission(role, "manage_settings"));

  if (!canAccess || !role) {
    return { community: null, canAccess: false };
  }

  const stats = await fetchCommunityStats(
    communityRow.id,
    communityRow.member_count,
  );

  return {
    community: {
      ...mapCommunityRow(communityRow as CommunityWithCreator),
      viewerRole: role,
      stats,
    },
    canAccess: true,
  };
}
