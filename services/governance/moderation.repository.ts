import { createClient } from "@/lib/supabase/server";
import type {
  MemberStrike,
  ModerationAction,
  ModerationActionType,
} from "@/types/governance";

export async function insertModerationActionInDb(input: {
  communityId: string;
  actorId: string;
  targetUserId?: string | null;
  actionType: ModerationActionType;
  reportId?: string | null;
  restrictionId?: string | null;
  reason?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("moderation_actions")
    .insert({
      community_id: input.communityId,
      actor_id: input.actorId,
      target_user_id: input.targetUserId ?? null,
      action_type: input.actionType,
      report_id: input.reportId ?? null,
      restriction_id: input.restrictionId ?? null,
      reason: input.reason ?? null,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data.id as string };
}

export async function fetchModerationHistoryFromDb(
  communityId: string,
  limit = 50,
): Promise<ModerationAction[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("moderation_actions")
    .select(
      `
      id,
      community_id,
      actor_id,
      target_user_id,
      action_type,
      report_id,
      restriction_id,
      reason,
      metadata,
      created_at,
      actor:profiles!moderation_actions_actor_id_fkey (display_name),
      target:profiles!moderation_actions_target_user_id_fkey (display_name)
    `,
    )
    .eq("community_id", communityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[moderation.repository]", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const actor = row.actor as { display_name: string | null } | { display_name: string | null }[] | null;
    const target = row.target as { display_name: string | null } | { display_name: string | null }[] | null;
    const actorProfile = Array.isArray(actor) ? actor[0] : actor;
    const targetProfile = Array.isArray(target) ? target[0] : target;

    return {
      id: row.id as string,
      communityId: row.community_id as string,
      actorId: row.actor_id as string,
      targetUserId: row.target_user_id as string | null,
      actionType: row.action_type as ModerationActionType,
      reportId: row.report_id as string | null,
      restrictionId: row.restriction_id as string | null,
      reason: row.reason as string | null,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.created_at as string,
      actorDisplayName: actorProfile?.display_name ?? null,
      targetDisplayName: targetProfile?.display_name ?? null,
    };
  });
}

export async function insertStrikeInDb(input: {
  communityId: string;
  userId: string;
  strikeNumber: number;
  reason?: string;
  issuedBy: string;
  moderationActionId?: string;
  expiresAt?: string | null;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("community_member_strikes")
    .insert({
      community_id: input.communityId,
      user_id: input.userId,
      strike_number: input.strikeNumber,
      reason: input.reason ?? null,
      issued_by: input.issuedBy,
      moderation_action_id: input.moderationActionId ?? null,
      expires_at: input.expiresAt ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data.id as string };
}

export async function fetchActiveStrikesFromDb(
  communityId: string,
  userId: string,
): Promise<MemberStrike[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_member_strikes")
    .select("*")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .eq("active", true)
    .order("strike_number", { ascending: true });

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id as string,
    communityId: row.community_id as string,
    userId: row.user_id as string,
    strikeNumber: row.strike_number as number,
    reason: row.reason as string | null,
    issuedBy: row.issued_by as string | null,
    expiresAt: row.expires_at as string | null,
    active: row.active as boolean,
    createdAt: row.created_at as string,
  }));
}

export async function countActiveStrikesFromDb(
  communityId: string,
  userId: string,
): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;

  const { data, error } = await supabase.rpc("count_active_member_strikes", {
    p_community_id: communityId,
    p_user_id: userId,
  });

  if (error) return 0;
  return (data as number) ?? 0;
}

export async function insertMuteRestrictionInDb(input: {
  communityId: string;
  userId: string;
  actorId: string;
  reason?: string;
  restrictedUntil?: string | null;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("community_member_restrictions")
    .insert({
      community_id: input.communityId,
      user_id: input.userId,
      restriction_type: "mute",
      reason: input.reason ?? "Stummgeschaltet",
      restricted_until: input.restrictedUntil ?? null,
      created_by: input.actorId,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data.id as string };
}
