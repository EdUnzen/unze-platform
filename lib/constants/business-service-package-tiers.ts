/**
 * Servicepaket-Stufen — Preis, Inklusiv-Leistungen & Rabatt (ohne öffentliche Stundenlöhne)
 * SSOT: PROJEKTE/UNZE/SERVICEPAKET_PREISLOGIK.md
 * Stundensätze nur intern / im Vertrag — nicht auf der Website.
 */

export type ServicePackageTierId = "basis" | "business" | "premium" | "enterprise";

export type ServicePackageTierDetail = {
  id: ServicePackageTierId;
  slug: string;
  name: string;
  priceLabel: string;
  priceCents: number;
  /** Inklusive Stunden & Leistungen pro Monat */
  includedHoursLabel: string;
  /** Rabatt auf Weiterarbeit — ohne €/h öffentlich */
  discountLabel: string;
  /** Kurzinfo zu Leistungen über Kontingent hinaus */
  extraHoursNote: string;
  highlighted?: boolean;
};

/** Ohne Servicepaket — Einzelauftrag nach Abnahme */
export const SERVICE_WITHOUT_PACKAGE = {
  label: "Ohne Servicepaket (Einzelauftrag)",
  includedHours: "0 h",
  discountLabel: "Kein Paket-Rabatt",
  note: "Einzelpreis nach Vereinbarung · keine Priorität · Termine nach Verfügbarkeit",
} as const;

export const SERVICE_PACKAGE_TIERS: ServicePackageTierDetail[] = [
  {
    id: "basis",
    slug: "servicepaket-basis",
    name: "Basis",
    priceLabel: "49,90 €",
    priceCents: 4990,
    includedHoursLabel: "Wartung, Updates & Sicherheit inkl.",
    discountLabel: "Rabatt auf Änderungen vs. Einzelauftrag",
    extraHoursNote: "Änderungen zum vergünstigten Paket-Preis — Details im Vertrag",
  },
  {
    id: "business",
    slug: "servicepaket-business",
    name: "Business",
    priceLabel: "99,90 €",
    priceCents: 9990,
    includedHoursLabel: "1 h Änderungsleistung / Monat inkl.",
    discountLabel: "Vergünstigte Weiterarbeit inkl. Paket-Rabatt",
    extraHoursNote: "Kleinere Anpassungen oft innerhalb der Inklusiv-Stunde",
    highlighted: true,
  },
  {
    id: "premium",
    slug: "servicepaket-premium",
    name: "Premium",
    priceLabel: "199,90 €",
    priceCents: 19990,
    includedHoursLabel: "3 h Änderungsleistung / Monat inkl.",
    discountLabel: "Erweiterter Paket-Rabatt auf Weiterentwicklung",
    extraHoursNote: "Größere Änderungen — Rest zum vergünstigten Paket-Preis",
  },
  {
    id: "enterprise",
    slug: "servicepaket-enterprise",
    name: "Enterprise",
    priceLabel: "399,90 €",
    priceCents: 39990,
    includedHoursLabel: "1 h inkl. + bis 15 h/Monat vergünstigt",
    discountLabel: "Maximaler Paket-Rabatt · dedizierter Ansprechpartner",
    extraHoursNote: "Enterprise-Kontingent — Details und Konditionen im Vertrag",
  },
];

export function getServicePackageTier(slug: string): ServicePackageTierDetail | undefined {
  return SERVICE_PACKAGE_TIERS.find((t) => t.slug === slug);
}
