import type { SubscriptionStatus } from "@/types/database";

/** Vereinfachter Mitgliedschaftsstatus für Creator- und Nutzer-UI */
export type MembershipDisplayStatus = "active" | "payment_pending" | "ended";

export interface MembershipStatusInput {
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  updatedAt?: string | null;
  lastFailedPaymentAt?: string | null;
}

export function resolveMembershipDisplayStatus(
  input: MembershipStatusInput,
): MembershipDisplayStatus {
  if (input.status === "past_due" || input.status === "unpaid") {
    return "payment_pending";
  }
  if (input.status === "canceled" || input.status === "inactive") {
    return "ended";
  }
  if (input.status === "active" || input.status === "trialing") {
    return "active";
  }
  return "ended";
}

function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function membershipStatusLabel(input: MembershipStatusInput): string {
  const display = resolveMembershipDisplayStatus(input);

  if (display === "active") {
    if (input.cancelAtPeriodEnd) {
      return "Aktiv — Kündigung zum Periodenende";
    }
    return "Aktiv";
  }

  if (display === "payment_pending") {
    const reference = input.lastFailedPaymentAt ?? input.updatedAt;
    const days = daysSince(reference);
    if (days != null && days >= 1) {
      return days >= 7
        ? `Zahlung ausstehend seit ${days} Tagen`
        : `Zahlung ausstehend seit ${days} Tag${days === 1 ? "" : "en"}`;
    }
    return "Zahlung ausstehend";
  }

  return "Mitgliedschaft beendet";
}

export const MEMBERSHIP_STATUS_UI: Record<
  MembershipDisplayStatus,
  { emoji: string; badgeClass: string; dotClass: string }
> = {
  active: {
    emoji: "🟢",
    badgeClass: "bg-unze-green-muted text-unze-green-dark",
    dotClass: "bg-unze-green",
  },
  payment_pending: {
    emoji: "🟡",
    badgeClass: "bg-amber-100 text-amber-900",
    dotClass: "bg-amber-500",
  },
  ended: {
    emoji: "🔴",
    badgeClass: "bg-red-100 text-red-800",
    dotClass: "bg-red-500",
  },
};

export function isPaymentIssueStatus(status: SubscriptionStatus): boolean {
  return status === "past_due" || status === "unpaid";
}
