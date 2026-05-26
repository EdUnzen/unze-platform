/** Revenue Share — transparent & einfach (kein MLM) */

/** Plattformgebühr auf Bruttozahlungen */
export const PLATFORM_FEE_PERCENT = 7.7;

/** Anteil vom Netto-Plattformanteil für werbenden Creator */
export const REFERRER_SHARE_OF_NET_PERCENT = 11;

/** Schätzung Stripe-Gebühr für Netto-Kalkulation (Sandbox-Hinweis) */
export const STRIPE_ESTIMATE_FEE_PERCENT = 2.9;
export const STRIPE_ESTIMATE_FIXED_CENTS = 30;

export const PLATFORM_FEE_LABEL = `${PLATFORM_FEE_PERCENT.toLocaleString("de-DE")} % Plattformgebühr`;

export const REFERRER_SHARE_LABEL = `${REFERRER_SHARE_OF_NET_PERCENT.toLocaleString("de-DE")} % vom Netto-Plattformanteil`;

export const REVENUE_SHARE_SUMMARY =
  "11 % vom Netto-Plattformanteil (nach Stripe-Gebühren und 7,7 % Plattformgebühr) — optional, kein Multi-Level-System.";
