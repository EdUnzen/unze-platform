import { createClient } from "@/lib/supabase/server";
import type { ReferralStatus } from "@/types/referral";

export interface ReferralRow {
  id: string;
  referred_user_id: string;
  referrer_user_id: string;
  status: ReferralStatus;
  conflict_note: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchReferralByReferredUser(
  referredUserId: string,
): Promise<ReferralRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("creator_referrals")
    .select("*")
    .eq("referred_user_id", referredUserId)
    .maybeSingle();

  if (error?.message?.includes("creator_referrals")) return null;
  if (error || !data) return null;
  return data as ReferralRow;
}

export async function fetchReferralsByReferrer(
  referrerUserId: string,
): Promise<ReferralRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("creator_referrals")
    .select("*")
    .eq("referrer_user_id", referrerUserId)
    .order("created_at", { ascending: false });

  if (error?.message?.includes("creator_referrals")) return [];
  return (data ?? []) as ReferralRow[];
}

export async function insertReferral(input: {
  referredUserId: string;
  referrerUserId: string;
  status: ReferralStatus;
}): Promise<{ id: string | null; error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { id: null, error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("creator_referrals")
    .insert({
      referred_user_id: input.referredUserId,
      referrer_user_id: input.referrerUserId,
      status: input.status,
    })
    .select("id")
    .single();

  if (error) return { id: null, error: error.message };
  return { id: data.id as string, error: null };
}

export async function updateReferralConflict(
  referralId: string,
  conflictNote: string,
  alternateReferrerId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("creator_referrals")
    .update({
      status: "conflict",
      conflict_note: conflictNote,
      metadata: { alternate_referrer_id: alternateReferrerId },
    })
    .eq("id", referralId);

  return { error: error?.message ?? null };
}

export async function fetchRevenueLedgerForUser(
  userId: string,
  limit = 20,
): Promise<
  {
    id: string;
    community_id: string | null;
    creator_user_id: string;
    referrer_user_id: string | null;
    gross_amount_cents: number;
    platform_fee_cents: number;
    net_platform_cents: number;
    referrer_share_cents: number;
    currency: string;
    ledger_status: string;
    created_at: string;
  }[]
> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("revenue_share_ledger")
    .select("*")
    .or(`creator_user_id.eq.${userId},referrer_user_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error?.message?.includes("revenue_share_ledger")) return [];
  return data ?? [];
}

export async function insertSandboxLedgerEntry(input: {
  communityId?: string;
  creatorUserId: string;
  referrerUserId?: string | null;
  grossAmountCents: number;
  platformFeeCents: number;
  netPlatformCents: number;
  referrerShareCents: number;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("revenue_share_ledger").insert({
    community_id: input.communityId ?? null,
    creator_user_id: input.creatorUserId,
    referrer_user_id: input.referrerUserId ?? null,
    gross_amount_cents: input.grossAmountCents,
    platform_fee_cents: input.platformFeeCents,
    net_platform_cents: input.netPlatformCents,
    referrer_share_cents: input.referrerShareCents,
    ledger_status: "sandbox",
  });

  return { error: error?.message ?? null };
}
