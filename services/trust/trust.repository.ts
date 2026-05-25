import { createClient } from "@/lib/supabase/server";
import type { TrustEvent, TrustEventType, UserTrustFlag } from "@/types/governance";

export async function insertTrustEventInDb(input: {
  userId?: string | null;
  communityId?: string | null;
  eventType: TrustEventType;
  delta?: number;
  metadata?: Record<string, unknown>;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("trust_events").insert({
    user_id: input.userId ?? null,
    community_id: input.communityId ?? null,
    event_type: input.eventType,
    delta: input.delta ?? 0,
    metadata: input.metadata ?? {},
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function adjustUserReputationInDb(
  userId: string,
  delta: number,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("reputation_score")
    .eq("id", userId)
    .single();

  const current = (profile?.reputation_score as number) ?? 0;
  const next = Math.max(0, current + delta);

  const { error } = await supabase
    .from("profiles")
    .update({ reputation_score: next })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function adjustCommunityTrustInDb(
  communityId: string,
  delta: number,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data: community } = await supabase
    .from("communities")
    .select("trust_score")
    .eq("id", communityId)
    .single();

  const current = (community?.trust_score as number) ?? 100;
  const next = Math.max(0, Math.min(1000, current + delta));

  const { error } = await supabase
    .from("communities")
    .update({ trust_score: next })
    .eq("id", communityId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function insertTrustFlagInDb(input: {
  userId: string;
  flagType: UserTrustFlag["flagType"];
  communityId?: string | null;
  reason?: string;
  createdBy?: string;
  expiresAt?: string | null;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("user_trust_flags").insert({
    user_id: input.userId,
    flag_type: input.flagType,
    community_id: input.communityId ?? null,
    reason: input.reason ?? null,
    created_by: input.createdBy ?? null,
    expires_at: input.expiresAt ?? null,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function fetchUserTrustEventsFromDb(
  userId: string,
  limit = 20,
): Promise<TrustEvent[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("trust_events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    userId: row.user_id as string | null,
    communityId: row.community_id as string | null,
    eventType: row.event_type as TrustEventType,
    delta: row.delta as number,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  }));
}

export async function fetchActiveTrustFlagsFromDb(
  userId: string,
): Promise<UserTrustFlag[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("user_trust_flags")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    flagType: row.flag_type as UserTrustFlag["flagType"],
    communityId: row.community_id as string | null,
    reason: row.reason as string | null,
    active: row.active as boolean,
    expiresAt: row.expires_at as string | null,
    createdAt: row.created_at as string,
  }));
}
