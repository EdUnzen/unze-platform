import type { BillingPlanInterval } from "@/types/billing";

export const STRIPE_INTERVAL_MAP: Record<
  Exclude<BillingPlanInterval, "one_time">,
  { interval: "month" | "year"; interval_count: number }
> = {
  month: { interval: "month", interval_count: 1 },
  semiannual: { interval: "month", interval_count: 6 },
  year: { interval: "year", interval_count: 1 },
};

export function planIntervalToStripe(interval: BillingPlanInterval) {
  if (interval === "one_time") return null;
  return STRIPE_INTERVAL_MAP[interval];
}

export function formatCentsEUR(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function parseEuroToCents(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}
