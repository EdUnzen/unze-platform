import { calculateRevenueSplit } from "@/lib/revenue/calculate-split";
import { createClient } from "@/lib/supabase/server";
import type {
  CreatorReferral,
  ReferralSummary,
  RevenueLedgerEntry,
} from "@/types/referral";
import {
  fetchReferralByReferredUser,
  fetchReferralsByReferrer,
  fetchRevenueLedgerForUser,
  insertReferral,
  insertSandboxLedgerEntry,
  updateReferralConflict,
} from "./referral.repository";

async function enrichReferral(row: {
  id: string;
  referred_user_id: string;
  referrer_user_id: string;
  status: CreatorReferral["status"];
  conflict_note: string | null;
  created_at: string;
  updated_at: string;
}): Promise<CreatorReferral> {
  const supabase = await createClient();
  let referrerDisplayName: string | null = null;
  let referrerUsername: string | null = null;
  let referredDisplayName: string | null = null;

  if (supabase) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .in("id", [row.referrer_user_id, row.referred_user_id]);

    for (const profile of profiles ?? []) {
      if (profile.id === row.referrer_user_id) {
        referrerDisplayName = (profile.display_name as string) ?? null;
        referrerUsername = (profile.username as string) ?? null;
      }
      if (profile.id === row.referred_user_id) {
        referredDisplayName = (profile.display_name as string) ?? null;
      }
    }
  }

  return {
    id: row.id,
    referredUserId: row.referred_user_id,
    referrerUserId: row.referrer_user_id,
    status: row.status,
    conflictNote: row.conflict_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    referrerDisplayName,
    referrerUsername,
    referredDisplayName,
  };
}

export async function claimCreatorReferral(
  referredUserId: string,
  referrerUserId: string,
): Promise<{ error: string | null; status?: CreatorReferral["status"] }> {
  if (referredUserId === referrerUserId) {
    return { error: "Du kannst dich nicht selbst als Referral angeben." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data: referrer } = await supabase
    .from("profiles")
    .select("id, is_creator")
    .eq("id", referrerUserId)
    .maybeSingle();

  if (!referrer?.is_creator) {
    return { error: "Nur verifizierte Creator können als Referral angegeben werden." };
  }

  const existing = await fetchReferralByReferredUser(referredUserId);

  if (!existing) {
    const result = await insertReferral({
      referredUserId,
      referrerUserId,
      status: "active",
    });
    if (result.error) return { error: result.error };
    return { error: null, status: "active" };
  }

  if (existing.referrer_user_id === referrerUserId) {
    return { error: null, status: existing.status };
  }

  await updateReferralConflict(
    existing.id,
    "Referral-Konflikt vorhanden — bitte prüfen.",
    referrerUserId,
  );

  return { error: null, status: "conflict" };
}

export async function getReferralSummary(userId: string): Promise<ReferralSummary> {
  const [myRow, madeRows] = await Promise.all([
    fetchReferralByReferredUser(userId),
    fetchReferralsByReferrer(userId),
  ]);

  const myReferral = myRow ? await enrichReferral(myRow) : null;
  const referralsMade = await Promise.all(madeRows.map(enrichReferral));

  return {
    myReferral,
    referralsMade,
    activeCount: referralsMade.filter((r) => r.status === "active").length,
    conflictCount:
      (myReferral?.status === "conflict" ? 1 : 0) +
      referralsMade.filter((r) => r.status === "conflict").length,
  };
}

export async function searchCreatorsForReferral(
  query: string,
  limit = 8,
): Promise<{ id: string; name: string; username: string | null }[]> {
  const supabase = await createClient();
  if (!supabase || !query.trim()) return [];

  const q = `%${query.trim()}%`;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, username")
    .eq("is_creator", true)
    .or(`display_name.ilike.${q},username.ilike.${q}`)
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: (row.display_name as string) ?? (row.username as string) ?? "Creator",
    username: (row.username as string) ?? null,
  }));
}

export async function getRevenueLedger(userId: string): Promise<RevenueLedgerEntry[]> {
  const rows = await fetchRevenueLedgerForUser(userId);
  return rows.map((row) => ({
    id: row.id,
    communityId: row.community_id,
    creatorUserId: row.creator_user_id,
    referrerUserId: row.referrer_user_id,
    grossAmountCents: row.gross_amount_cents,
    platformFeeCents: row.platform_fee_cents,
    netPlatformCents: row.net_platform_cents,
    referrerShareCents: row.referrer_share_cents,
    currency: row.currency,
    ledgerStatus: row.ledger_status as RevenueLedgerEntry["ledgerStatus"],
    createdAt: row.created_at,
  }));
}

/** Sandbox-Beispielbuchung für Dashboard-Vorschau */
export async function recordSandboxRevenueExample(input: {
  creatorUserId: string;
  referrerUserId?: string | null;
  grossCents?: number;
  communityId?: string;
}): Promise<{ error: string | null }> {
  const grossCents = input.grossCents ?? 1999;
  const split = calculateRevenueSplit(grossCents, {
    hasActiveReferrer: Boolean(input.referrerUserId),
  });

  return insertSandboxLedgerEntry({
    communityId: input.communityId,
    creatorUserId: input.creatorUserId,
    referrerUserId: input.referrerUserId,
    grossAmountCents: split.grossCents,
    platformFeeCents: split.platformFeeCents,
    netPlatformCents: split.netPlatformCents,
    referrerShareCents: split.referrerShareCents,
  });
}
