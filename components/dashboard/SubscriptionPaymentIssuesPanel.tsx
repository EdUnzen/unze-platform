import { MembershipStatusBadge } from "@/components/billing/MembershipStatusBadge";
import {
  isPaymentIssueStatus,
  resolveMembershipDisplayStatus,
} from "@/lib/monetization/membership-status";
import type { CreatorSubscriptionRow } from "@/types/billing";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE");
}

interface SubscriptionPaymentIssuesPanelProps {
  subscriptions: CreatorSubscriptionRow[];
}

export function SubscriptionPaymentIssuesPanel({
  subscriptions,
}: SubscriptionPaymentIssuesPanelProps) {
  const issues = subscriptions.filter((sub) => isPaymentIssueStatus(sub.status));

  if (issues.length === 0) return null;

  return (
    <section
      id="payment-issues"
      className="rounded-3xl border border-amber-200 bg-amber-50/60 p-4 shadow-card"
    >
      <div className="mb-4 flex items-start gap-2">
        <span className="text-lg" aria-hidden>
          ⚠️
        </span>
        <div>
          <h2 className="text-sm font-semibold text-amber-950">
            Mitglieder mit offenen Zahlungen
          </h2>
          <p className="mt-0.5 text-xs text-amber-900/80">
            {issues.length} Mitglied{issues.length === 1 ? "" : "er"} — Zahlung über Stripe
            ausstehend oder mehrfach fehlgeschlagen.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-amber-200/80 text-xs text-amber-900/70">
              <th className="py-2 pr-4">Nutzername</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Letzte Zahlung</th>
              <th className="py-2">Mitgliedschaft läuft aus am</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((sub) => (
              <tr key={sub.id} className="border-b border-amber-200/50">
                <td className="py-3 pr-4 font-medium text-unze-ink">
                  {sub.username ? `@${sub.username}` : sub.displayName ?? "Mitglied"}
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
                <td className="py-3 text-unze-ink-secondary">
                  {formatDate(sub.currentPeriodEnd)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function countPaymentIssueSubscriptions(
  subscriptions: CreatorSubscriptionRow[],
): number {
  return subscriptions.filter((sub) => isPaymentIssueStatus(sub.status)).length;
}

export { resolveMembershipDisplayStatus };
