/**
 * Kalkulation für Projekt-Grobschätzung — Add-ons & Stufen-Inklusivleistungen.
 * Sync mit business-pricing.ts · transparent im Studio & Anfrageformular.
 */

/** Zusatzleistung bei expliziter Auswahl (netto, Cent) */
export const INFRASTRUCTURE_ADDON_CENTS: Record<string, number> = {
  domain: 7900,
  hosting: 9900,
  email: 4900,
  stripe: 14900,
  newsletter: 7900,
  migration: 19900,
  seo: 9900,
};

/** In Stufenpreis enthalten — fehlt im Formular → Gutschrift */
export const TIER_BUNDLED_INFRASTRUCTURE: Record<string, Partial<Record<number, readonly string[]>>> = {
  landingpages: {
    1: ["seo"],
    2: ["seo"],
  },
  websites: {
    1: ["seo"],
    2: ["seo", "newsletter"],
  },
};

export const INFRASTRUCTURE_LABELS: Record<string, string> = {
  domain: "Domain & DNS",
  hosting: "Hosting & SSL",
  email: "E-Mail-Einrichtung",
  stripe: "Zahlungen (Stripe)",
  newsletter: "Newsletter / Marketing-Tools",
  migration: "Migration bestehender Seite",
  seo: "SEO-Basis & Tracking",
};
