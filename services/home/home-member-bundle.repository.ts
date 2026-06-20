import { mapCommunityRow, mapDiscoverGroupRow } from "@/lib/mappers/community.mapper";
import { createClient } from "@/lib/supabase/server";
import { enrichCommunitiesForViewer } from "@/services/community/community.viewer-enrichment";
import { enrichCommunitiesWithEngagement } from "@/services/engagement/engagement.service";
import { fetchUpcomingEventsForCommunitiesWithClient } from "@/services/events/event.repository";
import type { HomePendingApplication } from "@/services/home/home.service";
import type { Community, DiscoverGroup } from "@/types/community";
import type { CommunityRole, CommunityWithCreator, ProfileRow } from "@/types/database";
import type { CommunityEvent } from "@/types/event";

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

export type HomeMemberBundle = {
  profile: ProfileRow | null;
  unreadNotifications: number;
  showDashboard: boolean;
  myCommunities: Community[];
  followedCommunities: Community[];
  followedGroups: DiscoverGroup[];
  pendingApplications: HomePendingApplication[];
  upcomingEvents: CommunityEvent[];
};

const EMPTY_BUNDLE: HomeMemberBundle = {
  profile: null,
  unreadNotifications: 0,
  showDashboard: false,
  myCommunities: [],
  followedCommunities: [],
  followedGroups: [],
  pendingApplications: [],
  upcomingEvents: [],
};

function mapMemberCommunities(
  rows: Array<{ role: string; community: unknown }> | null,
): Community[] {
  if (!rows) return [];

  return rows
    .map((row) => {
      const raw = row.community as
        | Parameters<typeof mapCommunityRow>[0]
        | Parameters<typeof mapCommunityRow>[0][]
        | null;
      const community = Array.isArray(raw) ? raw[0] : raw;
      if (!community) return null;
      return mapCommunityRow(community, {
        membership: {
          isMember: true,
          role: row.role as CommunityRole,
        },
      });
    })
    .filter((c): c is Community => Boolean(c));
}

function mapPendingApplications(rows: unknown[] | null): HomePendingApplication[] {
  if (!rows) return [];

  return rows
    .map((entry) => {
      const row = entry as {
        id: string;
        status: string;
        created_at: string;
        community: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
      };
      const raw = row.community;
      const community = Array.isArray(raw) ? raw[0] : raw;
      if (!community) return null;
      return {
        id: row.id,
        communityId: community.id,
        communityTitle: community.title,
        communitySlug: community.slug,
        status: row.status,
        createdAt: row.created_at,
      };
    })
    .filter((a): a is HomePendingApplication => Boolean(a));
}

async function enrichFollowedCommunities(
  communities: Community[],
  userId: string,
): Promise<Community[]> {
  if (communities.length === 0) return communities;

  const [enriched, withEngagement] = await Promise.all([
    enrichCommunitiesForViewer(communities, userId),
    enrichCommunitiesWithEngagement(communities, userId),
  ]);

  const engagementById = new Map(withEngagement.map((c) => [c.id, c.engagement]));
  return enriched.map((c) => ({
    ...c,
    engagement: engagementById.get(c.id) ?? c.engagement,
  }));
}

/**
 * Home-Mitglied: ein Supabase-Client, weniger Roundtrips.
 * Wave 1: Profil, Badge, Mitgliedschaften, Follows, Antraege (parallel).
 * Wave 2: gefolgte Communities/Gruppen + Events (IDs aus Wave 1, keine Duplikate).
 */
export async function fetchHomeMemberBundleFromDb(
  userId: string,
): Promise<HomeMemberBundle> {
  const supabase = await createClient();
  if (!supabase) return EMPTY_BUNDLE;

  const [profileRes, notifRes, membersRes, followsRes, appsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null),
    supabase
      .from("community_members")
      .select(`role, community:communities (${COMMUNITY_SELECT})`)
      .eq("user_id", userId)
      .order("joined_at", { ascending: false }),
    supabase
      .from("follows")
      .select("target_type, target_community_id, target_group_id")
      .eq("follower_id", userId),
    supabase
      .from("community_join_applications")
      .select(
        `
        id,
        status,
        created_at,
        community:communities (id, title, slug)
      `,
      )
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const myCommunities = mapMemberCommunities(membersRes.data);
  const pendingApplications = mapPendingApplications(appsRes.data);
  const showDashboard = (membersRes.data ?? []).some((row) =>
    MANAGER_ROLES.includes(row.role as CommunityRole),
  );

  const followedCommunityIds: string[] = [];
  const followedGroupIds: string[] = [];
  for (const row of followsRes.data ?? []) {
    if (row.target_type === "community" && row.target_community_id) {
      followedCommunityIds.push(row.target_community_id as string);
    }
    if (row.target_type === "group" && row.target_group_id) {
      followedGroupIds.push(row.target_group_id as string);
    }
  }

  const memberCommunityIds = myCommunities.map((c) => c.id);
  const eventCommunityIds = [
    ...new Set([...memberCommunityIds, ...followedCommunityIds]),
  ];

  const [followedCommunitiesRes, followedGroupsRes, upcomingEvents] =
    await Promise.all([
      followedCommunityIds.length > 0
        ? supabase
            .from("communities")
            .select(COMMUNITY_SELECT)
            .in("id", followedCommunityIds)
        : Promise.resolve({ data: [], error: null }),
      followedGroupIds.length > 0
        ? supabase
            .from("community_groups")
            .select(
              `
              id,
              community_id,
              slug,
              title,
              description,
              sort_order,
              is_public,
              group_type,
              view_count_weekly,
              share_count,
              community:communities!inner (
                slug,
                title,
                platform_type,
                member_count,
                banner_gradient,
                is_verified,
                is_trending,
                discover_enabled,
                visibility,
                category,
                rating_avg,
                review_count,
                monetization_enabled
              )
            `,
            )
            .in("id", followedGroupIds)
        : Promise.resolve({ data: [], error: null }),
      fetchUpcomingEventsForCommunitiesWithClient(
        supabase,
        eventCommunityIds,
        8,
      ),
    ]);

  const followedRaw = (followedCommunitiesRes.data ?? []).map((row) =>
    mapCommunityRow(row as CommunityWithCreator),
  );
  const followedCommunities = await enrichFollowedCommunities(followedRaw, userId);

  const followedGroups = (followedGroupsRes.data ?? [])
    .map((row) => mapDiscoverGroupRow(row))
    .filter((group): group is DiscoverGroup => Boolean(group));

  return {
    profile: (profileRes.data as ProfileRow | null) ?? null,
    unreadNotifications: notifRes.count ?? 0,
    showDashboard,
    myCommunities,
    followedCommunities,
    followedGroups,
    pendingApplications,
    upcomingEvents,
  };
}
