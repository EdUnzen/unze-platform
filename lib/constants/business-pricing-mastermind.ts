/**
 * Preis-Mastermind — interne Stundenlogik (Studio only, nie öffentlich).
 * Öffentliche Paketpreise bleiben in business-pricing.ts.
 */

/** Interner Listen-Stundensatz (Richtwert Kalkulation) */
export const INTERNAL_HOURLY_RATE_CENTS = 7990;

/** Praxis-Ziel: effektive €/h bei Paketpreisen (Nebengewerbe) */
export const TARGET_EFFECTIVE_HOURLY_CENTS = 5500;

/** Langfristiger Orientierungswert — nicht öffentlich, nicht aktiv erzwingen */
export const ASPIRATION_HOURLY_CENTS = 9790;

/** Geschätzte Netto-Stunden je Kategorie + Stufen-Index (0-based) */
export const TIER_HOUR_ESTIMATES: Record<
  string,
  readonly { min: number; suggested: number; max: number }[]
> = {
  landingpages: [
    { min: 4, suggested: 6, max: 9 },
    { min: 7, suggested: 10, max: 14 },
    { min: 11, suggested: 15, max: 20 },
  ],
  websites: [
    { min: 7, suggested: 10, max: 14 },
    { min: 11, suggested: 15, max: 20 },
    { min: 16, suggested: 22, max: 30 },
  ],
  "business-core": [
    { min: 18, suggested: 28, max: 40 },
    { min: 28, suggested: 40, max: 55 },
    { min: 45, suggested: 60, max: 85 },
  ],
  webapps: [
    { min: 16, suggested: 25, max: 35 },
    { min: 30, suggested: 45, max: 60 },
    { min: 50, suggested: 70, max: 95 },
  ],
  modules: [
    { min: 3, suggested: 5, max: 8 },
    { min: 5, suggested: 8, max: 12 },
    { min: 5, suggested: 8, max: 14 },
  ],
  service: [
    { min: 1, suggested: 1.5, max: 2 },
    { min: 1.5, suggested: 2.5, max: 4 },
    { min: 3, suggested: 4, max: 6 },
    { min: 4, suggested: 6, max: 10 },
  ],
};

export const BRIEFING_REQUIREMENTS = [
  {
    id: "logo",
    label: "Logo",
    detail: "PNG oder SVG, mind. 500 px breit, transparent wenn möglich",
    required: true,
  },
  {
    id: "texts",
    label: "Texte",
    detail: "Firmenname, Leistungen, Über uns, Kontakt — als Word/Docs oder klar strukturiert",
    required: true,
  },
  {
    id: "images",
    label: "Bilder",
    detail: "Hero + optional Team/Referenzen (JPG/WebP, keine Handy-Screenshots wenn möglich)",
    required: true,
  },
  {
    id: "legal",
    label: "Impressum & Datenschutz",
    detail: "Fertige Texte oder klare Vorgabe · sonst Platzhalter-Hinweis",
    required: true,
  },
  {
    id: "reference",
    label: "Referenz-Template",
    detail: "Welche Branche/Vorlage aus unserem Designsystem (z. B. Arztpraxis, Umzug)",
    required: true,
  },
  {
    id: "colors",
    label: "Farben (optional)",
    detail: "Wunschfarben oder „wie Referenz“",
    required: false,
  },
] as const;

export type BriefingReadiness = {
  hasLogo?: boolean;
  hasTexts?: boolean;
  hasImages?: boolean;
  hasLegalTexts?: boolean;
  hasReference?: boolean;
  materialNotes?: string;
  uploadedFileNames?: string[];
};

export const BRIEFING_COMPLETE_MESSAGE =
  "Erst wenn Briefing vollständig ist, starten wir die Umsetzung — geplante Lieferzeit gilt ab vollständigem Material.";
