"use client";

import { startCommunitySubscriptionCheckoutAction } from "@/app/billing/actions";
import {
  buildCommunityPlanPrices,
  type CommunityPricing,
} from "@/lib/monetization/pricing-display";
import { CreditCard } from "lucide-react";
import { useTransition } from "react";

interface SubscribeCommunityPanelProps {
  communityId: string;
  slug: string;
  monetizationEnabled: boolean;
  pricing?: CommunityPricing;
  hasMonthly?: boolean;
  hasSemiannual?: boolean;
  hasYearly?: boolean;
}

export function SubscribeCommunityPanel({
  communityId,
  slug,
  monetizationEnabled,
  pricing = {},
  hasMonthly,
  hasSemiannual,
  hasYearly,
}: SubscribeCommunityPanelProps) {
  const [pending, startTransition] = useTransition();

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
      <p className="flex items-center gap-1.5 text-xs font-semibold text-unze-green-dark">
        <CreditCard className="h-4 w-4" />
        Abo abschließen
      </p>
      <p className="text-[11px] text-unze-ink-secondary">
        Preis vor Checkout — Zahlung über Stripe.
      </p>
      <div className="flex flex-col gap-2">
        {plans.map(({ interval, buttonLabel }) => (
          <button
            key={interval}
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await startCommunitySubscriptionCheckoutAction(
                  communityId,
                  slug,
                  interval,
                );
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
