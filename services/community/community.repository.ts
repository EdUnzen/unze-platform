import { mapCommunityRow } from "@/lib/mappers/community.mapper";
import { createClient } from "@/lib/supabase/server";
import type { Community } from "@/types/community";
import type {
  CommunityRole,
  CommunityVisibility,
  CommunityWithCreator,
  PlatformType,
} from "@/types/database";
import { countGroupsByCommunityId } from "./group.repository";
import { fetchMembership } from "./member.repository";
import { getJoinAccessState } from "@/services/access/access.service";

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

export async function fetchCommunitiesFromDb(options?: {
  trending?: boolean;
  discover?: boolean;
  limit?: number;
}): Promise<Community[] | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  let query = supabase
    .from("communities")
    .select(COMMUNITY_SELECT)
    .in("visibility", ["public", "premium"]);

  if (options?.discover !== false) {
    query = query.eq("discover_enabled", true);
  }

  if (options?.trending) {
    query = query.eq("is_trending", true);
  }

  if (options?.discover) {
    query = query
      .order("discover_score", { ascending: false })
      .order("member_count", { ascending: false });
  } else {
    query = query.order("member_count", { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  let { data, error } = await query;

  const missingDiscoverScore =
    error &&
    (error.code === "42703" ||
      error.message?.includes("discover_score") ||
      error.message?.includes("does not exist"));

  if (missingDiscoverScore && options?.discover) {
    let fallback = supabase
      .from("communities")
      .select(COMMUNITY_SELECT)
      .in("visibility", ["public", "premium"])
      .eq("discover_enabled", true);
    if (options.trending) fallback = fallback.eq("is_trending", true);
    fallback = fallback.order("member_count", { ascending: false });
    if (options.limit) fallback = fallback.limit(options.limit);
    ({ data, error } = await fallback);
  }

  if (error) {
    console.error("[community.repository] fetchCommunities:", error.message);
    if (error.message.includes("Invalid API key")) {
      const { getSupabaseEnvHint } = await import("@/lib/env");
      const hint = getSupabaseEnvHint();
      if (hint) console.error("[community.repository]", hint);
    }
    return null;
  }

  return (data ?? []).map((row) => mapCommunityRow(row as CommunityWithCreator));
}

export async function fetchCommunityBySlugFromDb(
  slug: string,
  viewerId?: string | null,
  inviteCode?: string | null,
): Promise<Community | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("communities")
    .select(COMMUNITY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[community.repository] fetchBySlug:", error.message);
    return null;
  }

  const communityId = data.id;
  let membership: { isMember: boolean; role: CommunityRole | null } | undefined;
  let isFollowing = false;

  let groupCount: number;

  if (viewerId) {
    const [member, followRes, counted] = await Promise.all([
      fetchMembership(communityId, viewerId),
      supabase
        .from("follows")
        .select("id")
        .eq("follower_id", viewerId)
        .eq("target_type", "community")
        .eq("target_community_id", communityId)
        .maybeSingle(),
      countGroupsByCommunityId(communityId),
    ]);
    membership = {
      isMember: Boolean(member),
      role: member?.role ?? null,
    };
    isFollowing = Boolean(followRes.data);
    groupCount = counted;
  } else {
    groupCount = await countGroupsByCommunityId(communityId);
  }

  let joinAccess;
  if (viewerId) {
    joinAccess = await getJoinAccessState(
      communityId,
      viewerId,
      membership?.isMember ?? false,
      inviteCode,
    );
  }

  const community = mapCommunityRow(data as CommunityWithCreator, {
    membership,
    isFollowing,
    groupCount,
  });

  return { ...community, joinAccess };
}

export async function fetchCommunitiesByIds(
  ids: string[],
): Promise<Community[] | null> {
  if (ids.length === 0) return [];

  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("communities")
    .select(COMMUNITY_SELECT)
    .in("id", ids);

  if (error) {
    console.error("[community.repository] fetchByIds:", error.message);
    return null;
  }

  return (data ?? []).map((row) => mapCommunityRow(row as CommunityWithCreator));
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return true;

  const { data } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return !data;
}

export async function createCommunityInDb(input: {
  slug: string;
  title: string;
  description: string;
  platformType: PlatformType;
  category: string;
  tags: string[];
  focusTags?: string[];
  visibility: CommunityVisibility;
  bannerGradient?: string;
  externalUrl?: string;
  discoverEnabled?: boolean;
  creatorId: string;
}): Promise<Community | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("communities")
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description,
      platform_type: input.platformType,
      category: input.category,
      tags: input.tags,
      focus_tags: input.focusTags?.length ? input.focusTags : [],
      visibility: input.visibility,
      banner_gradient:
        input.bannerGradient ??
        "from-emerald-500/90 via-teal-600/80 to-cyan-700/70",
      external_url: input.externalUrl || null,
      discover_enabled: input.discoverEnabled ?? true,
      creator_id: input.creatorId,
    })
    .select(COMMUNITY_SELECT)
    .single();

  if (error || !data) {
    console.error("[community.repository] create:", error?.message);
    return null;
  }

  const communityId = (data as { id: string }).id;
  const { insertCreatorMembershipInDb } = await import("./member.repository");
  const memberResult = await insertCreatorMembershipInDb(communityId, input.creatorId);

  if (memberResult.error) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    if (admin) {
      const { error: adminMemberErr } = await admin.from("community_members").insert({
        community_id: communityId,
        user_id: input.creatorId,
        role: "creator",
      });
      if (adminMemberErr && !adminMemberErr.message.includes("duplicate")) {
        console.error("[community.repository] creator member:", adminMemberErr.message);
        return null;
      }
    } else {
      console.error("[community.repository] creator member:", memberResult.error);
      return null;
    }
  }

  return mapCommunityRow(data as CommunityWithCreator, {
    membership: { isMember: true, role: "creator" },
  });
}

export async function updateCommunityInDb(
  communityId: string,
  input: Partial<{
    title: string;
    description: string;
    platformType: PlatformType;
    category: string;
    tags: string[];
    focusTags: string[];
    visibility: CommunityVisibility;
    bannerGradient: string;
    externalUrl: string | null;
    discoverEnabled: boolean;
    isTrending: boolean;
    monetizationEnabled: boolean;
  }>,
): Promise<Community | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.platformType !== undefined) payload.platform_type = input.platformType;
  if (input.category !== undefined) payload.category = input.category;
  if (input.tags !== undefined) payload.tags = input.tags;
  if (input.focusTags !== undefined) payload.focus_tags = input.focusTags;
  if (input.visibility !== undefined) payload.visibility = input.visibility;
  if (input.bannerGradient !== undefined) payload.banner_gradient = input.bannerGradient;
  if (input.externalUrl !== undefined) payload.external_url = input.externalUrl;
  if (input.discoverEnabled !== undefined) payload.discover_enabled = input.discoverEnabled;
  if (input.isTrending !== undefined) payload.is_trending = input.isTrending;
  if (input.monetizationEnabled !== undefined) {
    payload.monetization_enabled = input.monetizationEnabled;
  }

  const { data, error } = await supabase
    .from("communities")
    .update(payload)
    .eq("id", communityId)
    .select(COMMUNITY_SELECT)
    .single();

  if (error || !data) {
    console.error("[community.repository] update:", error?.message);
    return null;
  }

  return mapCommunityRow(data as CommunityWithCreator);
}

export async function fetchCommunitiesByCreatorId(
  creatorId: string,
): Promise<Community[] | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("communities")
    .select(COMMUNITY_SELECT)
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) return null;
  return (data ?? []).map((row) => mapCommunityRow(row as CommunityWithCreator));
}

export async function fetchCommunitySlugById(
  communityId: string,
): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("communities")
    .select("slug")
    .eq("id", communityId)
    .maybeSingle();

  if (error || !data) return null;
  return data.slug;
}
