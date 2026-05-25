import { createClient } from "@/lib/supabase/server";

export async function softRemoveMemberInDb(
  memberId: string,
  actorId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.rpc("soft_remove_community_member", {
    p_member_id: memberId,
    p_actor_id: actorId,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function restoreMemberInDb(
  memberId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.rpc("restore_community_member", {
    p_member_id: memberId,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function softDeleteCommunityInDb(
  communityId: string,
  actorId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("communities")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: actorId,
      access_status: "archived",
      archived_at: new Date().toISOString(),
      discover_enabled: false,
    })
    .eq("id", communityId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function archiveCommunityInDb(
  communityId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("communities")
    .update({
      access_status: "archived",
      archived_at: new Date().toISOString(),
      discover_enabled: false,
    })
    .eq("id", communityId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function pauseCommunityInDb(
  communityId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("communities")
    .update({
      access_status: "paused",
      admissions_paused: true,
    })
    .eq("id", communityId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function fetchRemovedMembersFromDb(
  communityId: string,
): Promise<
  {
    id: string;
    userId: string;
    role: string;
    deletedAt: string;
    displayName: string | null;
  }[]
> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("community_members")
    .select(
      `
      id,
      user_id,
      role,
      deleted_at,
      profile:profiles (display_name)
    `,
    )
    .eq("community_id", communityId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  return (data ?? []).map((row) => {
    const profile = row.profile as { display_name: string | null } | { display_name: string | null }[] | null;
    const p = Array.isArray(profile) ? profile[0] : profile;
    return {
      id: row.id as string,
      userId: row.user_id as string,
      role: row.role as string,
      deletedAt: row.deleted_at as string,
      displayName: p?.display_name ?? null,
    };
  });
}
