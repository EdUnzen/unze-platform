"use client";

import { startCommunitySubscriptionCheckoutAction } from "@/app/billing/actions";
import {
  buildCommunityPlanPrices,
  type CommunityPricing,
} from "@/lib/monetization/pricing-display";
import { CreditCard } from "lucide-react";
import { useState, useTransition } from "react";

interface SubscribeCommunityPanelProps {
  communityId: string;
  slug: string;
  monetizationEnabled: boolean;
  pricing?: CommunityPricing;
  hasMonthly?: boolean;
  hasSemiannual?: boolean;
  hasYearly?: boolean;
  checkoutCancelled?: boolean;
}

export function SubscribeCommunityPanel({
  communityId,
  slug,
  monetizationEnabled,
  pricing = {},
  hasMonthly,
  hasSemiannual,
  hasYearly,
  checkoutCancelled = false,
}: SubscribeCommunityPanelProps) {
  const [pending, startTransition] = useTransition();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!monetizationEnabled) return null;

  const pricedPlans = buildCommunityPlanPrices(pricing);
  const plans = pricedPlans.filter(({ interval }) => {
    if (interval === "month") return hasMonthly !== false;
    if (interval === "semiannual") return hasSemiannual !== false;
    if (interval === "year") return hasYearly !== false;
    return true;
  });

  if (plans.length === 0) {
    return (
      <div className="rounded-xl border border-unze-border bg-unze-surface-muted/40 px-3 py-3 text-xs text-unze-ink-secondary">
        Kostenpflichtiger Zugang — Preise werden vom Creator eingerichtet.
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-unze-green/30 bg-unze-green-muted/20 p-3">
      {checkoutCancelled && (
        <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] text-amber-900">
          Zahlungsvorgang abgebrochen — du kannst jederzeit erneut ein Abo abschließen.
        </p>
      )}
      {checkoutError && (
        <p className="rounded-lg bg-red-50 px-2.5 py-2 text-[11px] text-red-800" role="alert">
          {checkoutError}
        </p>
      )}
      <p className="flex items-center gap-1.5 text-xs font-semibold text-unze-green-dark">
        <CreditCard className="h-4 w-4" />
        Abo abschließen
      </p>
      <p className="text-[11px] text-unze-ink-secondary">
        Preis vor der Zahlung — Abwicklung über Stripe.
      </p>
      <div className="flex flex-col gap-2">
        {plans.map(({ interval, buttonLabel }) => (
          <button
            key={interval}
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setCheckoutError(null);
                const result = await startCommunitySubscriptionCheckoutAction(
                  communityId,
                  slug,
                  interval,
                );
                if (result?.error) {
                  setCheckoutError(result.error);
                }
              })
            }
            className="rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {buttonLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
