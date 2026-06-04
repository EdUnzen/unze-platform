import { mapJoinApplicationRow } from "@/lib/mappers/access.mapper";
import { createClient } from "@/lib/supabase/server";
import type { Community } from "@/types/community";
import type { CommunityRole } from "@/types/database";

/**
 * Reichert Community-Listen für eingeloggte Nutzer mit Membership,
 * Follow-Status und Bewerbungsstatus an (Discover, Home, Favoriten).
 */
export async function enrichCommunitiesForViewer(
  communities: Community[],
  viewerId: string,
): Promise<Community[]> {
  if (communities.length === 0) return communities;

  const supabase = await createClient();
  if (!supabase) return communities;

  const ids = communities.map((c) => c.id);

  const [membershipsRes, followsRes, applicationsRes] = await Promise.all([
    supabase
      .from("community_members")
      .select("community_id, role")
      .eq("user_id", viewerId)
      .in("community_id", ids)
      .is("deleted_at", null),
    supabase
      .from("follows")
      .select("target_community_id")
      .eq("follower_id", viewerId)
      .eq("target_type", "community")
      .in("target_community_id", ids),
    supabase
      .from("community_join_applications")
      .select("*")
      .eq("user_id", viewerId)
      .in("community_id", ids)
      .order("created_at", { ascending: false }),
  ]);

  const memberships = membershipsRes.error ? [] : membershipsRes.data;
  const follows = followsRes.error ? [] : followsRes.data;
  const applications = applicationsRes.error ? [] : applicationsRes.data;

  const membershipByCommunity = new Map<string, CommunityRole>();
  for (const row of memberships ?? []) {
    membershipByCommunity.set(
      row.community_id as string,
      row.role as CommunityRole,
    );
  }

  const followedIds = new Set(
    (follows ?? []).map((f) => f.target_community_id as string),
  );

  const applicationByCommunity = new Map<string, ReturnType<typeof mapJoinApplicationRow>>();
  for (const row of applications ?? []) {
    const communityId = row.community_id as string;
    if (!applicationByCommunity.has(communityId)) {
      applicationByCommunity.set(communityId, mapJoinApplicationRow(row));
    }
  }

  return communities.map((community) => {
    const role = membershipByCommunity.get(community.id) ?? null;
    const isMember = Boolean(role);
    const existingApplication = applicationByCommunity.get(community.id) ?? null;

    return {
      ...community,
      membership: isMember ? { isMember: true, role } : { isMember: false, role: null },
      isFollowing: followedIds.has(community.id),
      joinAccess: existingApplication
        ? {
            canJoinDirectly: false,
            requiresApplication: true,
            requiresInvite: false,
            blockReason: null,
            existingApplication,
            userRestriction: null,
          }
        : community.joinAccess,
    };
  });
}
