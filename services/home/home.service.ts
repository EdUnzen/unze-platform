import { mapCommunityRow } from "@/lib/mappers/community.mapper";
import { createClient } from "@/lib/supabase/server";
import type { Community } from "@/types/community";
import type { CommunityRole } from "@/types/database";
import { cache } from "react";
import { fetchHomeMemberBundleFromDb } from "./home-member-bundle.repository";

export type { HomeMemberBundle } from "./home-member-bundle.repository";

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

export type HomePendingApplication = {
  id: string;
  communityId: string;
  communityTitle: string;
  communitySlug: string;
  status: string;
  createdAt: string;
};

export async function getMyMemberCommunities(userId: string): Promise<Community[]> {
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
    .order("joined_at", { ascending: false });

  if (error || !data) return [];

  return data
    .map((row) => {
      const raw = row.community as Parameters<typeof mapCommunityRow>[0] | Parameters<typeof mapCommunityRow>[0][] | null;
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

export async function getMyPendingApplications(
  userId: string,
): Promise<HomePendingApplication[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
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
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data
    .map((row) => {
      const raw = row.community as { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
      const community = Array.isArray(raw) ? raw[0] : raw;
      if (!community) return null;
      return {
        id: row.id as string,
        communityId: community.id,
        communityTitle: community.title,
        communitySlug: community.slug,
        status: row.status as string,
        createdAt: row.created_at as string,
      };
    })
    .filter((a): a is HomePendingApplication => Boolean(a));
}

export async function countMyPendingApplications(userId: string): Promise<number> {
  const apps = await getMyPendingApplications(userId);
  return apps.length;
}

/** Ein Request-Bundle fuer Home (Mitglied) — weniger DB-Roundtrips als 8 Einzelcalls. */
export const getHomeMemberBundle = cache(fetchHomeMemberBundleFromDb);
