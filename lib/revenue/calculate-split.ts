import {
  PLATFORM_FEE_PERCENT,
  REFERRER_SHARE_OF_NET_PERCENT,
  STRIPE_ESTIMATE_FEE_PERCENT,
  STRIPE_ESTIMATE_FIXED_CENTS,
} from "@/lib/constants/revenue";

export interface RevenueSplitBreakdown {
  grossCents: number;
  stripeFeeCents: number;
  platformFeeCents: number;
  netPlatformCents: number;
  referrerShareCents: number;
  creatorNetCents: number;
  currency: string;
}

/** Netto-basierte Aufteilung — Sandbox-Schätzung, keine Rechtsberatung */
export function calculateRevenueSplit(
  grossCents: number,
  options?: { hasActiveReferrer?: boolean; currency?: string },
): RevenueSplitBreakdown {
  const currency = options?.currency ?? "eur";
  const stripeFeeCents = Math.round(
    grossCents * (STRIPE_ESTIMATE_FEE_PERCENT / 100) + STRIPE_ESTIMATE_FIXED_CENTS,
  );
  const afterStripe = Math.max(0, grossCents - stripeFeeCents);
  const platformFeeCents = Math.round(afterStripe * (PLATFORM_FEE_PERCENT / 100));
  const netPlatformCents = Math.max(0, afterStripe - platformFeeCents);
  const referrerShareCents = options?.hasActiveReferrer
    ? Math.round(netPlatformCents * (REFERRER_SHARE_OF_NET_PERCENT / 100))
    : 0;
  const creatorNetCents = Math.max(
    0,
    afterStripe - platformFeeCents - referrerShareCents,
  );

  return {
    grossCents,
    stripeFeeCents,
    platformFeeCents,
    netPlatformCents,
    referrerShareCents,
    creatorNetCents,
    currency,
  };
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
