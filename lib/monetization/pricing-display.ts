import { formatCentsEUR } from "@/lib/monetization/plans";
import { BILLING_PLAN_LABELS, type BillingPlanInterval } from "@/types/billing";

export interface CommunityPricing {
  monthlyCents?: number | null;
  semiannualCents?: number | null;
  yearlyCents?: number | null;
}

export interface CommunityPlanPrice {
  interval: Exclude<BillingPlanInterval, "one_time">;
  cents: number;
  buttonLabel: string;
  shortLabel: string;
}

export function formatGroupPrice(
  cents: number | null | undefined,
  currency = "eur",
): string | null {
  if (cents == null || cents <= 0) return null;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function buildCommunityPlanPrices(
  pricing: CommunityPricing,
): CommunityPlanPrice[] {
  const plans: CommunityPlanPrice[] = [];

  if (pricing.monthlyCents && pricing.monthlyCents > 0) {
    plans.push({
      interval: "month",
      cents: pricing.monthlyCents,
      buttonLabel: `${formatCentsEUR(pricing.monthlyCents)} · ${BILLING_PLAN_LABELS.month}`,
      shortLabel: `${formatCentsEUR(pricing.monthlyCents)}/Monat`,
    });
  }
  if (pricing.semiannualCents && pricing.semiannualCents > 0) {
    plans.push({
      interval: "semiannual",
      cents: pricing.semiannualCents,
      buttonLabel: `${formatCentsEUR(pricing.semiannualCents)} · ${BILLING_PLAN_LABELS.semiannual}`,
      shortLabel: `${formatCentsEUR(pricing.semiannualCents)}/6 Mon.`,
    });
  }
  if (pricing.yearlyCents && pricing.yearlyCents > 0) {
    plans.push({
      interval: "year",
      cents: pricing.yearlyCents,
      buttonLabel: `${formatCentsEUR(pricing.yearlyCents)} · ${BILLING_PLAN_LABELS.year}`,
      shortLabel: `${formatCentsEUR(pricing.yearlyCents)}/Jahr`,
    });
  }

  return plans;
}

export function buildCommunityPriceSummary(
  pricing: CommunityPricing,
  monetizationEnabled?: boolean,
): string | null {
  const plans = buildCommunityPlanPrices(pricing);
  if (plans.length === 0) {
    if (monetizationEnabled) return null;
    return "Kostenlos";
  }
  return plans.map((p) => p.shortLabel).join(" · ");
}
