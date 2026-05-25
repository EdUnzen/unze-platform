import { mapCommunityGroupRow } from "@/lib/mappers/community.mapper";
import { createClient } from "@/lib/supabase/server";
import type { CommunityGroup } from "@/types/community";

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

export async function createGroupInDb(input: {
  communityId: string;
  slug: string;
  title: string;
  description: string;
  isPublic?: boolean;
  sortOrder?: number;
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
  }>,
): Promise<CommunityGroup | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.isPublic !== undefined) payload.is_public = input.isPublic;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;

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
