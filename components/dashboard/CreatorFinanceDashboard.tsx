import { formatCentsEUR } from "@/lib/monetization/plans";
import type { CreatorFinanceStats, CreatorSubscriptionRow } from "@/types/billing";
import { BILLING_PLAN_LABELS } from "@/types/billing";

interface CreatorFinanceDashboardProps {
  stats: CreatorFinanceStats;
  subscriptions: CreatorSubscriptionRow[];
}

export function CreatorFinanceDashboard({
  stats,
  subscriptions,
}: CreatorFinanceDashboardProps) {
  const statCards = [
    { label: "Monatsumsatz", value: formatCentsEUR(stats.monthlyRevenueCents) },
    { label: "Aktive Mitglieder", value: String(stats.activeMembers) },
    { label: "Aktive Abos", value: String(stats.activeSubscriptions) },
    { label: "Kündigungen", value: String(stats.canceledSubscriptions) },
    { label: "Laufend auslaufend", value: String(stats.expiringSubscriptions) },
    { label: "Einmalzahlungen", value: String(stats.oneTimePayments) },
    { label: "Dienstleistungen", value: String(stats.serviceBookings) },
    { label: "Offene Anträge", value: String(stats.pendingApplications) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-4 shadow-card">
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
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-unze-border text-xs text-unze-ink-muted">
                  <th className="py-2 pr-4">Mitglied</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2">Ende</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-unze-border/60">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-unze-ink">
                        {sub.displayName ?? sub.username ?? "Mitglied"}
                      </p>
                      {sub.groupTitle && (
                        <p className="text-xs text-unze-ink-muted">{sub.groupTitle}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {sub.cancelAtPeriodEnd && sub.status === "active"
                        ? "Kündigt"
                        : sub.status}
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
                    <td className="py-3">
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString("de-DE")
                        : "—"}
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
