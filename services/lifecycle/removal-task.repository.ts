import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  MemberRemovalReason,
  MemberRemovalTaskView,
} from "@/types/removal";

function getAdmin() {
  return createAdminClient();
}

export async function upsertPendingRemovalTaskInDb(input: {
  communityId: string;
  userId: string;
  memberId?: string | null;
  reason: MemberRemovalReason;
  metadata?: Record<string, unknown>;
}): Promise<{ error: string | null; taskId?: string; created: boolean }> {
  const admin = getAdmin();
  if (!admin) return { error: "Service Role nicht konfiguriert", created: false };

  const { data: existing } = await admin
    .from("community_member_removal_tasks")
    .select("id, reason")
    .eq("community_id", input.communityId)
    .eq("user_id", input.userId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("community_member_removal_tasks")
      .update({
        reason: input.reason,
        member_id: input.memberId ?? null,
        metadata: input.metadata ?? {},
      })
      .eq("id", existing.id);

    return {
      error: error?.message ?? null,
      taskId: existing.id as string,
      created: false,
    };
  }

  const { data, error } = await admin
    .from("community_member_removal_tasks")
    .insert({
      community_id: input.communityId,
      user_id: input.userId,
      member_id: input.memberId ?? null,
      reason: input.reason,
      status: "pending",
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error) return { error: error.message, created: false };
  return { error: null, taskId: data.id as string, created: true };
}

export async function fetchPendingRemovalTasksFromDb(
  communityId: string,
): Promise<MemberRemovalTaskView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_member_removal_tasks")
    .select(
      `
      id,
      community_id,
      user_id,
      member_id,
      reason,
      status,
      metadata,
      created_at,
      confirmed_at,
      profile:profiles!community_member_removal_tasks_user_id_fkey (
        display_name,
        username
      )
    `,
    )
    .eq("community_id", communityId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    console.error("[removal-task.repository] fetch:", error.message);
    return [];
  }

  return (data ?? []).map(mapRemovalTaskRow);
}

export async function countPendingRemovalTasksFromDb(
  communityId: string,
): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("community_member_removal_tasks")
    .select("id", { count: "exact", head: true })
    .eq("community_id", communityId)
    .eq("status", "pending");

  if (error) {
    if (error.code === "42P01") return 0;
    return 0;
  }

  return count ?? 0;
}

export async function confirmRemovalTaskInDb(
  taskId: string,
  confirmedBy: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("community_member_removal_tasks")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      confirmed_by: confirmedBy,
    })
    .eq("id", taskId)
    .eq("status", "pending");

  if (error) return { error: error.message };
  return { error: null };
}

export async function fetchRemovalTaskByIdFromDb(taskId: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("community_member_removal_tasks")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();

  return data;
}

export async function softRemoveMemberByUserInDb(
  communityId: string,
  userId: string,
  actorId?: string | null,
): Promise<{ error: string | null; memberId: string | null }> {
  const admin = getAdmin();
  if (!admin) return { error: "Service Role nicht konfiguriert", memberId: null };

  const { data, error } = await admin.rpc("soft_remove_community_member_by_user", {
    p_community_id: communityId,
    p_user_id: userId,
    p_actor_id: actorId ?? userId,
  });

  if (error) return { error: error.message, memberId: null };
  return { error: null, memberId: (data as string | null) ?? null };
}

function mapRemovalTaskRow(row: Record<string, unknown>): MemberRemovalTaskView {
  const profile = row.profile as
    | { display_name: string | null; username: string | null }
    | { display_name: string | null; username: string | null }[]
    | null;
  const p = Array.isArray(profile) ? profile[0] : profile;

  return {
    id: row.id as string,
    communityId: row.community_id as string,
    userId: row.user_id as string,
    memberId: (row.member_id as string) ?? null,
    reason: row.reason as MemberRemovalTaskView["reason"],
    status: row.status as MemberRemovalTaskView["status"],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    confirmedAt: (row.confirmed_at as string) ?? null,
    displayName: p?.display_name ?? null,
    username: p?.username ?? null,
  };
}
