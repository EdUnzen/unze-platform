"use client";

import { MembershipStatusBadge } from "@/components/billing/MembershipStatusBadge";
import { SubscriptionPaymentIssuesPanel } from "@/components/dashboard/SubscriptionPaymentIssuesPanel";
import {
  isPaymentIssueStatus,
  resolveMembershipDisplayStatus,
} from "@/lib/monetization/membership-status";
import { formatCentsEUR } from "@/lib/monetization/plans";
import type { CreatorFinanceStats, CreatorSubscriptionRow } from "@/types/billing";
import { BILLING_PLAN_LABELS } from "@/types/billing";

interface CreatorFinanceDashboardProps {
  stats: CreatorFinanceStats;
  subscriptions: CreatorSubscriptionRow[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE");
}

function nextPaymentLabel(sub: CreatorSubscriptionRow): string {
  const display = resolveMembershipDisplayStatus({
    status: sub.status,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
  });
  if (display === "ended") return "—";
  if (sub.cancelAtPeriodEnd) {
    return sub.currentPeriodEnd
      ? `Ende ${formatDate(sub.currentPeriodEnd)}`
      : "Kündigung aktiv";
  }
  if (display === "active" && sub.currentPeriodEnd) {
    return formatDate(sub.currentPeriodEnd);
  }
  if (display === "payment_pending" && sub.currentPeriodEnd) {
    return `Fällig / Ende ${formatDate(sub.currentPeriodEnd)}`;
  }
  return "—";
}

export function CreatorFinanceDashboard({
  stats,
  subscriptions,
}: CreatorFinanceDashboardProps) {
  const statCards = [
    { label: "Monatsumsatz", value: formatCentsEUR(stats.monthlyRevenueCents) },
    { label: "Aktive Mitglieder", value: String(stats.activeMembers) },
    { label: "Aktive Abos", value: String(stats.activeSubscriptions) },
    {
      label: "Offene Zahlungen",
      value: String(stats.paymentIssues),
      highlight: stats.paymentIssues > 0,
    },
    { label: "Kündigungen", value: String(stats.canceledSubscriptions) },
    { label: "Laufend auslaufend", value: String(stats.expiringSubscriptions) },
    { label: "Einmalzahlungen", value: String(stats.oneTimePayments) },
    { label: "Services", value: String(stats.serviceBookings) },
  ];

  return (
    <div className="space-y-6">
      <SubscriptionPaymentIssuesPanel subscriptions={subscriptions} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl bg-white p-4 shadow-card ${
              card.highlight ? "ring-2 ring-amber-300" : ""
            }`}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-unze-ink-muted">
              {card.label}
            </p>
            <p className="mt-1 text-xl font-bold text-unze-ink">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl bg-white p-4 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-unze-ink">Abonnenten</h2>
        {subscriptions.length === 0 ? (
          <p className="text-sm text-unze-ink-secondary">Noch keine Abonnenten.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-unze-border text-xs text-unze-ink-muted">
                  <th className="py-2 pr-4">Mitglied</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Letzte Zahlung</th>
                  <th className="py-2 pr-4">Nächste Zahlung</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2">Status geändert</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className={`border-b border-unze-border/60 ${
                      isPaymentIssueStatus(sub.status) ? "bg-amber-50/40" : ""
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-unze-ink">
                        {sub.displayName ?? sub.username ?? "Mitglied"}
                      </p>
                      {sub.username && sub.displayName && (
                        <p className="text-xs text-unze-ink-muted">@{sub.username}</p>
                      )}
                      {sub.groupTitle && (
                        <p className="text-xs text-unze-ink-muted">{sub.groupTitle}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <MembershipStatusBadge
                        input={{
                          status: sub.status,
                          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
                          updatedAt: sub.updatedAt,
                          lastFailedPaymentAt: sub.lastFailedPaymentAt,
                        }}
                      />
                    </td>
                    <td className="py-3 pr-4 text-unze-ink-secondary">
                      {formatDate(sub.lastSuccessfulPaymentAt)}
                    </td>
                    <td className="py-3 pr-4 text-unze-ink-secondary">
                      {nextPaymentLabel(sub)}
                    </td>
                    <td className="py-3 pr-4">
                      {sub.planInterval
                        ? BILLING_PLAN_LABELS[
                            sub.planInterval as keyof typeof BILLING_PLAN_LABELS
                          ] ?? sub.planInterval
                        : "—"}
                      {sub.amountCents != null && (
                        <span className="text-unze-ink-muted">
                          {" "}
                          · {formatCentsEUR(sub.amountCents)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-unze-ink-secondary">
                      {formatDate(sub.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
