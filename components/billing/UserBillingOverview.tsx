"use client";

import { openStripeCustomerPortalAction } from "@/app/billing/actions";
import { formatCentsEUR } from "@/lib/monetization/plans";
import { BILLING_PLAN_LABELS } from "@/types/billing";
import type { UserPaymentView, UserSubscriptionView } from "@/types/billing";
import Link from "next/link";
import { useTransition } from "react";

interface UserBillingOverviewProps {
  subscriptions: UserSubscriptionView[];
  payments: UserPaymentView[];
}

function statusLabel(status: string, cancelAtPeriodEnd: boolean) {
  if (cancelAtPeriodEnd && status === "active") return "Kündigt zum Periodenende";
  switch (status) {
    case "active":
      return "Aktiv";
    case "trialing":
      return "Testphase";
    case "canceled":
      return "Gekündigt";
    case "past_due":
      return "Zahlung ausstehend";
    default:
      return status;
  }
}

export function UserBillingOverview({
  subscriptions,
  payments,
}: UserBillingOverviewProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-4 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-unze-ink">Meine Abonnements</h2>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await openStripeCustomerPortalAction();
              })
            }
            className="text-xs font-semibold text-unze-green"
          >
            Abo verwalten / kündigen
          </button>
        </div>
        {subscriptions.length === 0 ? (
          <p className="text-sm text-unze-ink-secondary">Noch keine Abonnements.</p>
        ) : (
          <ul className="space-y-3">
            {subscriptions.map((sub) => (
              <li
                key={sub.id}
                className="rounded-2xl border border-unze-border/80 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/community/${sub.communitySlug}`}
                      className="font-semibold text-unze-green"
                    >
                      {sub.communityTitle}
                    </Link>
                    {sub.groupTitle && (
                      <p className="text-xs text-unze-ink-muted">{sub.groupTitle}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-unze-ink-secondary">
                    {statusLabel(sub.status, sub.cancelAtPeriodEnd)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-unze-ink-secondary">
                  {sub.planInterval && BILLING_PLAN_LABELS[sub.planInterval as keyof typeof BILLING_PLAN_LABELS]}
                  {sub.amountCents != null && ` · ${formatCentsEUR(sub.amountCents)}`}
                  {sub.currentPeriodEnd &&
                    ` · bis ${new Date(sub.currentPeriodEnd).toLocaleDateString("de-DE")}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-unze-ink">Meine Zahlungen & Buchungen</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-unze-ink-secondary">Noch keine Zahlungen.</p>
        ) : (
          <ul className="space-y-3">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex items-start justify-between gap-2 rounded-2xl border border-unze-border/80 p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-unze-ink">
                    {payment.description ?? payment.communityTitle}
                  </p>
                  <p className="text-xs text-unze-ink-muted">
                    {new Date(payment.createdAt).toLocaleDateString("de-DE")} ·{" "}
                    {payment.paymentKind === "one_time" ? "Einmalzahlung" : "Abo-Rechnung"}
                  </p>
                </div>
                <span className="font-semibold text-unze-ink">
                  {formatCentsEUR(payment.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-unze-ink-muted">
          Rechnungen und Kündigungen werden über das Stripe-Kundenportal verwaltet.
        </p>
      </section>
    </div>
  );
}
