import { mapCommunityGroupRow, mapDiscoverGroupRow } from "@/lib/mappers/community.mapper";
import { createClient } from "@/lib/supabase/server";
import type { CommunityGroup, DiscoverGroup } from "@/types/community";

export async function fetchGroupsByCommunityId(
  communityId: string,
): Promise<CommunityGroup[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_groups")
    .select("*")
    .eq("community_id", communityId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[group.repository] fetch:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapCommunityGroupRow(row));
}

export async function fetchGroupBySlugsFromDb(
  communitySlug: string,
  groupSlug: string,
): Promise<DiscoverGroup | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .maybeSingle();

  if (communityError || !community) return null;

  const { data, error } = await supabase
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
      cover_url,
      price_cents,
      currency,
      rating_avg,
      review_count,
      member_count,
      community:communities!inner (
        slug,
        title,
        platform_type,
        member_count,
        banner_gradient,
        banner_url,
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
    .eq("community_id", community.id)
    .eq("slug", groupSlug)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[group.repository] bySlug:", error.message);
    return null;
  }

  return mapDiscoverGroupRow(data);
}

export async function createGroupInDb(input: {
  communityId: string;
  slug: string;
  title: string;
  description: string;
  isPublic?: boolean;
  sortOrder?: number;
  groupType?: "group" | "service";
  priceCents?: number | null;
  coverUrl?: string | null;
}): Promise<CommunityGroup | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("community_groups")
    .insert({
      community_id: input.communityId,
      slug: input.slug,
      title: input.title,
      description: input.description,
      is_public: input.isPublic ?? true,
      sort_order: input.sortOrder ?? 0,
      group_type: input.groupType ?? "group",
      price_cents: input.priceCents ?? null,
      cover_url: input.coverUrl ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[group.repository] create:", error?.message);
    return null;
  }

  return mapCommunityGroupRow(data);
}

export async function updateGroupInDb(
  groupId: string,
  input: Partial<{
    title: string;
    description: string;
    isPublic: boolean;
    sortOrder: number;
    priceCents: number | null;
  }>,
): Promise<CommunityGroup | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.isPublic !== undefined) payload.is_public = input.isPublic;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.priceCents !== undefined) payload.price_cents = input.priceCents;

  const { data, error } = await supabase
    .from("community_groups")
    .update(payload)
    .eq("id", groupId)
    .select()
    .single();

  if (error || !data) return null;
  return mapCommunityGroupRow(data);
}

export async function deleteGroupInDb(groupId: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("community_groups")
    .delete()
    .eq("id", groupId);

  return !error;
}

export async function countGroupsByCommunityId(
  communityId: string,
): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("community_groups")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);

  return count ?? 0;
}

export async function fetchDiscoverGroups(
  limit = 24,
  options?: { groupType?: "group" | "service" },
): Promise<DiscoverGroup[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const client = supabase;

  const extendedSelect = `
      id,
      community_id,
      slug,
      title,
      description,
      sort_order,
      is_public,
      group_type,
      price_cents,
      community:communities!inner (
        slug,
        title,
        platform_type,
        member_count,
        banner_gradient,
        banner_url,
        is_verified,
        is_trending,
        discover_enabled,
        visibility,
        category,
        rating_avg,
        review_count,
        monetization_enabled
      )
    `;

  const legacySelect = `
      id,
      community_id,
      slug,
      title,
      description,
      sort_order,
      is_public,
      community:communities!inner (
        slug,
        title,
        platform_type,
        member_count,
        banner_gradient,
        banner_url,
        is_verified,
        is_trending,
        discover_enabled,
        visibility,
        category,
        rating_avg,
        review_count,
        monetization_enabled
      )
    `;

  async function runQuery(select: string, applyGroupType: boolean) {
    let query = client
      .from("community_groups")
      .select(select)
      .eq("is_public", true)
      .order("sort_order", { ascending: true })
      .limit(100);

    if (applyGroupType && options?.groupType) {
      query = query.eq("group_type", options.groupType);
    }

    return query;
  }

  let { data, error } = await runQuery(extendedSelect, true);

  const missingColumn =
    error?.code === "42703" ||
    error?.code === "PGRST204" ||
    (error?.message?.includes("does not exist") ?? false);

  if (missingColumn) {
    ({ data, error } = await runQuery(legacySelect, false));
  }

  if (error) {
    console.error("[group.repository] discover:", error.message);
    return [];
  }

  let rows = (data ?? []) as unknown as Array<
    Record<string, unknown> & { community: unknown }
  >;

  if (options?.groupType && rows.length > 0 && rows[0].group_type == null) {
    rows = rows.filter(
      (row) => ((row.group_type as string | undefined) ?? "group") === options.groupType,
    );
  }

  return rows
    .filter((row) => {
      const community = Array.isArray(row.community)
        ? row.community[0]
        : row.community;
      return (
        community?.discover_enabled &&
        ["public", "premium"].includes(community.visibility)
      );
    })
    .map((row) =>
      mapDiscoverGroupRow(row as Parameters<typeof mapDiscoverGroupRow>[0]),
    )
    .filter((group): group is DiscoverGroup => Boolean(group))
    .slice(0, limit);
}
