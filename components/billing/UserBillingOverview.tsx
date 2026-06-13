"use client";

import { openStripeCustomerPortalAction } from "@/app/billing/actions";
import { MembershipStatusBadge } from "@/components/billing/MembershipStatusBadge";
import { resolveMembershipDisplayStatus } from "@/lib/monetization/membership-status";
import { formatCentsEUR } from "@/lib/monetization/plans";
import { BILLING_PLAN_LABELS } from "@/types/billing";
import type { UserPaymentView, UserSubscriptionView } from "@/types/billing";
import Link from "next/link";
import { useTransition } from "react";

interface UserBillingOverviewProps {
  subscriptions: UserSubscriptionView[];
  payments: UserPaymentView[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE");
}

function paymentStatusLabel(status: string): string {
  switch (status) {
    case "succeeded":
      return "Erfolgreich";
    case "failed":
      return "Fehlgeschlagen";
    case "refunded":
      return "Erstattet";
    case "pending":
      return "Ausstehend";
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
                  <MembershipStatusBadge
                    input={{
                      status: sub.status,
                      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
                      updatedAt: sub.updatedAt,
                      lastFailedPaymentAt: sub.lastFailedPaymentAt,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-unze-ink-secondary">
                  {sub.planInterval &&
                    BILLING_PLAN_LABELS[sub.planInterval as keyof typeof BILLING_PLAN_LABELS]}
                  {sub.amountCents != null && ` · ${formatCentsEUR(sub.amountCents)}`}
                </p>
                <p className="mt-1 text-xs text-unze-ink-muted">
                  Letzte Zahlung: {formatDate(sub.lastSuccessfulPaymentAt)}
                  {resolveMembershipDisplayStatus({
                    status: sub.status,
                    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
                  }) === "active" &&
                    sub.currentPeriodEnd &&
                    !sub.cancelAtPeriodEnd &&
                    ` · Nächste Zahlung: ${formatDate(sub.currentPeriodEnd)}`}
                  {sub.cancelAtPeriodEnd &&
                    sub.currentPeriodEnd &&
                    ` · Läuft aus am: ${formatDate(sub.currentPeriodEnd)}`}
                  {sub.updatedAt && ` · Status geändert: ${formatDate(sub.updatedAt)}`}
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
                    {payment.paymentKind === "one_time" ? "Einmalzahlung" : "Abo-Rechnung"} ·{" "}
                    {paymentStatusLabel(payment.status)}
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
