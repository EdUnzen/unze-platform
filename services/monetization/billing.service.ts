import type {
  CreatorFinanceStats,
  CreatorSubscriptionRow,
  UserPaymentView,
  UserSubscriptionView,
} from "@/types/billing";
import type { SubscriptionStatus } from "@/types/database";
import { countPendingApplicationsFromDb } from "@/services/access/access.repository";
import {
  countSubscriptionsByStatus,
  getCommunitySubscriptionsForCreator,
  getUserSubscriptions,
} from "@/services/monetization/subscription.repository";
import {
  getCommunityPaymentsForCreator,
  getSubscriptionPaymentTimestampsByCommunity,
  getUserPayments,
  sumMonthlyRevenueCents,
} from "@/services/monetization/payment.repository";
import { createClient } from "@/lib/supabase/server";

function mapUserSubscription(row: Record<string, unknown>): UserSubscriptionView {
  const community = Array.isArray(row.community) ? row.community[0] : row.community;
  const group = Array.isArray(row.group) ? row.group[0] : row.group;

  return {
    id: row.id as string,
    communityId: row.community_id as string,
    communityTitle: (community?.title as string) ?? "Community",
    communitySlug: (community?.slug as string) ?? "",
    groupId: (row.group_id as string) ?? null,
    groupTitle: (group?.title as string) ?? null,
    status: row.status as SubscriptionStatus,
    planInterval: (row.plan_interval as string) ?? null,
    amountCents: (row.amount_cents as number) ?? null,
    currency: (row.currency as string) ?? "eur",
    currentPeriodEnd: (row.current_period_end as string) ?? null,
    canceledAt: (row.canceled_at as string) ?? null,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    stripeCustomerId: (row.stripe_customer_id as string) ?? null,
    updatedAt: (row.updated_at as string) ?? null,
    lastSuccessfulPaymentAt: null,
    lastFailedPaymentAt: null,
  };
}

function mapUserPayment(row: Record<string, unknown>): UserPaymentView {
  const community = Array.isArray(row.community) ? row.community[0] : row.community;
  const group = Array.isArray(row.group) ? row.group[0] : row.group;

  return {
    id: row.id as string,
    communityId: row.community_id as string,
    communityTitle: (community?.title as string) ?? "Community",
    communitySlug: (community?.slug as string) ?? "",
    groupId: (row.group_id as string) ?? null,
    groupTitle: (group?.title as string) ?? null,
    amountCents: row.amount_cents as number,
    currency: (row.currency as string) ?? "eur",
    status: row.status as string,
    paymentKind: row.payment_kind as string,
    description: (row.description as string) ?? null,
    createdAt: row.created_at as string,
    stripeInvoiceId: (row.stripe_invoice_id as string) ?? null,
  };
}

export async function getUserBillingOverview(userId: string) {
  const [subs, payments] = await Promise.all([
    getUserSubscriptions(userId),
    getUserPayments(userId),
  ]);

  const paymentTimestamps = new Map<
    string,
    { lastSuccessfulPaymentAt: string | null; lastFailedPaymentAt: string | null }
  >();
  for (const payment of payments) {
    if (payment.payment_kind !== "subscription_invoice") continue;
    const communityId = payment.community_id as string;
    if (!paymentTimestamps.has(communityId)) {
      paymentTimestamps.set(communityId, {
        lastSuccessfulPaymentAt: null,
        lastFailedPaymentAt: null,
      });
    }
    const entry = paymentTimestamps.get(communityId)!;
    const createdAt = payment.created_at as string;
    if (payment.status === "succeeded" && !entry.lastSuccessfulPaymentAt) {
      entry.lastSuccessfulPaymentAt = createdAt;
    }
    if (payment.status === "failed" && !entry.lastFailedPaymentAt) {
      entry.lastFailedPaymentAt = createdAt;
    }
  }

  return {
    subscriptions: subs.map((r) => {
      const mapped = mapUserSubscription(r as Record<string, unknown>);
      const timestamps = paymentTimestamps.get(mapped.communityId);
      return {
        ...mapped,
        lastSuccessfulPaymentAt: timestamps?.lastSuccessfulPaymentAt ?? null,
        lastFailedPaymentAt: timestamps?.lastFailedPaymentAt ?? null,
      };
    }),
    payments: payments.map((r) => mapUserPayment(r as Record<string, unknown>)),
  };
}

export async function getCreatorFinanceOverview(
  communityId: string,
): Promise<{
  stats: CreatorFinanceStats;
  subscriptions: CreatorSubscriptionRow[];
}> {
  const supabase = await createClient();
  const [monthlyRevenueCents, subCounts, payments, pendingApplications, subRows, paymentTimestamps] =
    await Promise.all([
      sumMonthlyRevenueCents(communityId),
      countSubscriptionsByStatus(communityId),
      getCommunityPaymentsForCreator(communityId),
      countPendingApplicationsFromDb(communityId),
      getCommunitySubscriptionsForCreator(communityId),
      getSubscriptionPaymentTimestampsByCommunity(communityId),
    ]);

  let activeMembers = 0;
  if (supabase) {
    const { count } = await supabase
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId)
      .is("deleted_at", null);
    activeMembers = count ?? 0;
  }

  const oneTimePayments = payments.filter((p) => p.payment_kind === "one_time").length;
  const serviceBookings = payments.filter((p) => p.group_id).length;

  const subscriptions: CreatorSubscriptionRow[] = subRows.map((row) => {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
    const group = Array.isArray(row.group) ? row.group[0] : row.group;
    const userId = row.user_id as string;
    const timestamps = paymentTimestamps.get(userId);
    return {
      id: row.id as string,
      userId,
      displayName: (profile?.display_name as string) ?? null,
      username: (profile?.username as string) ?? null,
      status: row.status as SubscriptionStatus,
      planInterval: (row.plan_interval as string) ?? null,
      amountCents: (row.amount_cents as number) ?? null,
      currentPeriodEnd: (row.current_period_end as string) ?? null,
      currentPeriodStart: (row.current_period_start as string) ?? null,
      canceledAt: (row.canceled_at as string) ?? null,
      cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
      groupTitle: (group?.title as string) ?? null,
      updatedAt: (row.updated_at as string) ?? null,
      lastSuccessfulPaymentAt: timestamps?.lastSuccessfulPaymentAt ?? null,
      lastFailedPaymentAt: timestamps?.lastFailedPaymentAt ?? null,
    };
  });

  return {
    stats: {
      monthlyRevenueCents,
      activeMembers,
      activeSubscriptions: subCounts.active,
      canceledSubscriptions: subCounts.canceled,
      expiringSubscriptions: subCounts.expiring,
      paymentIssues: subCounts.paymentIssues,
      oneTimePayments,
      serviceBookings,
      pendingApplications,
      currency: "eur",
    },
    subscriptions,
  };
}
