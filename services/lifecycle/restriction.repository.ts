import { createClient } from "@/lib/supabase/server";
import type { CommunityMemberRestriction, RestrictionType } from "@/types/lifecycle";

function mapRestrictionRow(row: {
  id: string;
  community_id: string;
  user_id: string;
  restriction_type: RestrictionType;
  reason: string | null;
  restricted_until: string | null;
  created_by: string | null;
  lifted_at: string | null;
  created_at: string;
}): CommunityMemberRestriction {
  return {
    id: row.id,
    communityId: row.community_id,
    userId: row.user_id,
    restrictionType: row.restriction_type,
    reason: row.reason,
    restrictedUntil: row.restricted_until,
    createdBy: row.created_by,
    liftedAt: row.lifted_at,
    createdAt: row.created_at,
    isActive: !row.lifted_at && (
      !row.restricted_until || new Date(row.restricted_until) > new Date()
    ),
  };
}

export async function fetchActiveRestrictionFromDb(
  communityId: string,
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("is_user_restricted_from_community", {
    p_community_id: communityId,
    p_user_id: userId,
  });

  if (error) {
    const { data: row } = await supabase
      .from("community_member_restrictions")
      .select("reason, restriction_type, restricted_until")
      .eq("community_id", communityId)
      .eq("user_id", userId)
      .is("lifted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) return null;
    if (row.restricted_until && new Date(row.restricted_until) <= new Date()) {
      return null;
    }
    return row.reason ?? "Beitritt nicht möglich";
  }

  return (data as string | null) ?? null;
}

export async function createRestrictionInDb(input: {
  communityId: string;
  userId: string;
  restrictionType: RestrictionType;
  reason?: string;
  restrictedUntil?: string | null;
  createdBy: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("community_member_restrictions").insert({
    community_id: input.communityId,
    user_id: input.userId,
    restriction_type: input.restrictionType,
    reason: input.reason ?? null,
    restricted_until: input.restrictedUntil ?? null,
    created_by: input.createdBy,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function liftRestrictionInDb(
  restrictionId: string,
  liftedBy: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("community_member_restrictions")
    .update({
      lifted_at: new Date().toISOString(),
      lifted_by: liftedBy,
    })
    .eq("id", restrictionId)
    .is("lifted_at", null);

  if (error) return { error: error.message };
  return { error: null };
}

export async function fetchRestrictionsForCommunityFromDb(
  communityId: string,
): Promise<CommunityMemberRestriction[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_member_restrictions")
    .select(
      `
      *,
      profile:profiles!community_member_restrictions_user_id_fkey (
        display_name,
        username,
        avatar_url
      )
    `,
    )
    .eq("community_id", communityId)
    .is("lifted_at", null)
    .order("created_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map((row) => {
    const rawProfile = row.profile as
      | { display_name: string | null; username: string | null; avatar_url: string | null }
      | { display_name: string | null; username: string | null; avatar_url: string | null }[]
      | null;
    const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;

    return {
      ...mapRestrictionRow(row),
      displayName: profile?.display_name ?? null,
      username: profile?.username ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    };
  });
}

export async function saveApplicationFileMetaInDb(input: {
  applicationId: string;
  questionId: string | null;
  fileName: string;
  mimeType?: string;
  fileSizeBytes?: number;
  storagePath?: string;
  publicUrl?: string;
}): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { error } = await supabase.from("community_join_application_files").insert({
    application_id: input.applicationId,
    question_id: input.questionId,
    file_name: input.fileName,
    mime_type: input.mimeType ?? null,
    file_size_bytes: input.fileSizeBytes ?? null,
    storage_path: input.storagePath ?? null,
    public_url: input.publicUrl ?? null,
  });

  return !error;
}
