import type { SubscriptionStatus } from "@/types/database";

export type BillingPlanInterval = "month" | "semiannual" | "year" | "one_time";

export const BILLING_PLAN_LABELS: Record<BillingPlanInterval, string> = {
  month: "Monatlich",
  semiannual: "Halbjährlich",
  year: "Jährlich",
  one_time: "Einmalzahlung",
};

export interface UserSubscriptionView {
  id: string;
  communityId: string;
  communityTitle: string;
  communitySlug: string;
  groupId: string | null;
  groupTitle: string | null;
  status: SubscriptionStatus;
  planInterval: string | null;
  amountCents: number | null;
  currency: string;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
}

export interface UserPaymentView {
  id: string;
  communityId: string;
  communityTitle: string;
  communitySlug: string;
  groupId: string | null;
  groupTitle: string | null;
  amountCents: number;
  currency: string;
  status: string;
  paymentKind: string;
  description: string | null;
  createdAt: string;
  stripeInvoiceId: string | null;
}

export interface CreatorFinanceStats {
  monthlyRevenueCents: number;
  activeMembers: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  expiringSubscriptions: number;
  oneTimePayments: number;
  serviceBookings: number;
  pendingApplications: number;
  currency: string;
}

export interface CreatorSubscriptionRow {
  id: string;
  userId: string;
  displayName: string | null;
  username: string | null;
  status: SubscriptionStatus;
  planInterval: string | null;
  amountCents: number | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  cancelAtPeriodEnd: boolean;
  groupTitle: string | null;
}
