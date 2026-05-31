import { mapCommunityRow } from "@/lib/mappers/community.mapper";
import { hasCommunityPermission } from "@/lib/permissions/community.permissions";
import { createClient } from "@/lib/supabase/server";
import type { ManagedCommunity, CommunityDashboardStats } from "@/types/dashboard";
import type { CommunityRole, CommunityWithCreator } from "@/types/database";
import { fetchBatchCommunityDashboardStats } from "./dashboard-stats.batch";

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

const MANAGER_ROLES: CommunityRole[] = ["creator", "admin", "moderator", "expert"];

async function fetchCommunityStats(
  communityId: string,
  memberCount: number,
  engagement?: { view_count_weekly?: number; share_count?: number },
): Promise<CommunityDashboardStats> {
  const { stats } = await fetchBatchCommunityDashboardStats(
    [communityId],
    { [communityId]: memberCount },
    { [communityId]: engagement ?? {} },
  );
  return (
    stats[communityId] ?? {
      memberCount,
      groupCount: 0,
      postCount: 0,
      followerCount: 0,
      badgeCount: 0,
      weeklyViews: engagement?.view_count_weekly ?? 0,
      shareCount: engagement?.share_count ?? 0,
      weeklyPosts: 0,
    }
  );
}

export async function hasManagedCommunities(userId: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("community_members")
    .select("id")
    .eq("user_id", userId)
    .in("role", MANAGER_ROLES)
    .limit(1)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
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

  const rows: {
    community: CommunityWithCreator;
    role: CommunityRole;
  }[] = [];

  for (const row of data) {
    const rawCommunity = row.community as CommunityWithCreator | CommunityWithCreator[] | null;
    const community = Array.isArray(rawCommunity) ? rawCommunity[0] : rawCommunity;
    if (!community) continue;
    rows.push({ community, role: row.role as CommunityRole });
  }

  if (rows.length === 0) return [];

  const memberCounts: Record<string, number> = {};
  const engagement: Record<string, { view_count_weekly?: number; share_count?: number }> = {};

  for (const { community } of rows) {
    memberCounts[community.id] = community.member_count;
    engagement[community.id] = {
      view_count_weekly: (community as { view_count_weekly?: number }).view_count_weekly,
      share_count: (community as { share_count?: number }).share_count,
    };
  }

  const { stats, pendingApplications } = await fetchBatchCommunityDashboardStats(
    rows.map((r) => r.community.id),
    memberCounts,
    engagement,
  );

  return rows.map(({ community, role }) => ({
    ...mapCommunityRow(community),
    viewerRole: role,
    stats: stats[community.id]!,
    pendingApplicationCount: pendingApplications[community.id] ?? 0,
  }));
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
    {
      view_count_weekly: (communityRow as { view_count_weekly?: number }).view_count_weekly,
      share_count: (communityRow as { share_count?: number }).share_count,
    },
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
