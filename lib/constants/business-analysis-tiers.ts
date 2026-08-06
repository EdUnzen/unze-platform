/**
 * CORSA Analyse-System — 3 Stufen (Quick / Business / Premium)
 * Quelle: CORSA_MASTER_STANDARD/05_Spezialmodule/Analyse_System.md
 */

export type AnalysisTierId = "quick" | "business" | "premium";

export type AnalysisTier = {
  id: AnalysisTierId;
  stage: 1 | 2 | 3;
  name: string;
  subtitle: string;
  audience: string;
  dataSources: string;
  deliverablesLabel: string;
  deliverables: string[];
  includesPreviousTier?: boolean;
  duration?: string;
  priceCents: number;
  priceDisplay: string;
  pricePeriod?: string;
  /** Kurzer Hinweis warum „ab“ (Business/Premium) */
  entryPriceNote?: string;
  /** Gutschrift bei Projekt/Umsetzung — prominent auf der Karte */
  creditNote?: string;
  creditBadge?: string;
  requiresPayment: boolean;
  highlighted?: boolean;
  note?: string;
};

export const ANALYSIS_PRICE_DISCLAIMER =
  "Orientierungspreis. Der verbindliche Betrag wird vor Beauftragung im Angebot bestätigt.";

export const ANALYSIS_TIERS: AnalysisTier[] = [
  {
    id: "quick",
    stage: 1,
    name: "Quick Analyse",
    subtitle: "Öffentliche Websiteanalyse — weitgehend automatisiert",
    audience: "Interessenten mit Website und kurzen Angaben",
    dataSources: "Ausschließlich öffentlich zugängliche Informationen",
    deliverablesLabel: "Enthält:",
    deliverables: [
      "Öffentliche Websiteanalyse",
      "Design",
      "Benutzerführung",
      "Mobile Darstellung",
      "Erste SEO-Einschätzung",
      "Performance-Eindruck",
      "Erste Verbesserungsvorschläge",
      "Kurzer PDF-Bericht",
    ],
    duration: "Weitgehend automatisiert",
    priceCents: 5_990,
    priceDisplay: "59,90 €",
    requiresPayment: true,
    note:
      "Basierend auf öffentlich sichtbaren Informationen — ersetzt keine technische Prüfung interner Systeme.",
  },
  {
    id: "business",
    stage: 2,
    name: "Business Analyse",
    subtitle: "Vertiefte Unternehmensanalyse nach ausführlichem Fragebogen",
    audience: "Unternehmen mit konkretem Digitalisierungs- oder Projektinteresse",
    dataSources: "Website plus ausführlicher Fragebogen (Prozesse, Software, Ziele)",
    deliverablesLabel: "Enthält zusätzlich:",
    includesPreviousTier: true,
    deliverables: [
      "Ausführlicher Fragebogen",
      "KI-Auswertung",
      "Unternehmensanalyse",
      "Automatisierungspotenzial",
      "Business-Core-Empfehlungen",
      "Priorisierte Maßnahmen",
      "Professioneller Bericht",
    ],
    priceCents: 24_900,
    priceDisplay: "ab 249 €",
    pricePeriod: " einmalig",
    entryPriceNote: "Abhängig von Umfang und Unternehmensgröße.",
    creditBadge: "100 % Gutschrift bei Auftrag",
    creditNote: "Bei Projektbeauftragung rechnen wir den Analysebetrag vollständig an.",
    requiresPayment: true,
    highlighted: true,
  },
  {
    id: "premium",
    stage: 3,
    name: "Premium Analyse",
    subtitle: "Individuelle Beratung mit persönlichem Gespräch und Strategie",
    audience: "Unternehmen mit langfristiger Digitalisierungsstrategie",
    dataSources:
      "Fragebogen, persönliches Gespräch, optional Zugänge zu Systemen (nur mit Zustimmung)",
    deliverablesLabel: "Enthält zusätzlich:",
    includesPreviousTier: true,
    deliverables: [
      "Persönliches Gespräch",
      "Individuelle Zieldefinition",
      "Detaillierte Unternehmensanalyse",
      "Strategie",
      "Roadmap",
      "Individuelle Lösungskonzepte",
      "Konkretes Angebot",
    ],
    priceCents: 49_000,
    priceDisplay: "ab 490 €",
    pricePeriod: " einmalig",
    entryPriceNote: "Abhängig von Umfang und Unternehmensgröße.",
    creditBadge: "100 % Gutschrift bei Umsetzung",
    creditNote: "Bei anschließender Umsetzung rechnen wir den Analysebetrag vollständig an.",
    requiresPayment: true,
  },
];

export const ANALYSIS_COMPANY_SIZES = [
  "1–9 Mitarbeiter",
  "10–49 Mitarbeiter",
  "50–249 Mitarbeiter",
  "250+ Mitarbeiter",
] as const;

export function getAnalysisTier(id: AnalysisTierId): AnalysisTier | undefined {
  return ANALYSIS_TIERS.find((t) => t.id === id);
}

export function isAnalysisTierId(value: string): value is AnalysisTierId {
  return value === "quick" || value === "business" || value === "premium";
}

/** 8-Schritte-Workflow — UNZE Business Analyse-Produkt */
export const ANALYSIS_WORKFLOW_STEPS = [
  { step: "Stufe wählen", detail: "Quick, Business oder Premium." },
  { step: "Formular", detail: "Angaben je nach Stufe — Website, Branche, Ziele, Fragebogen." },
  { step: "Zahlung", detail: "Sichere Online-Zahlung — danach startet die Auswertung." },
  { step: "KI-Analyse", detail: "Automatische Datensammlung und Erstanalyse." },
  { step: "Entwurf", detail: "Strukturierter Analysebericht als Entwurf." },
  { step: "Qualitätsprüfung", detail: "UNZE Business prüft und ergänzt." },
  { step: "Freigabe", detail: "Professioneller Bericht für den Kunden." },
  { step: "Angebot", detail: "Optional: individuelles Umsetzungsangebot." },
] as const;

/** Transparenz-Kategorien im Bericht (CORSA AS1–AS3) */
export const ANALYSIS_REPORT_CATEGORIES = [
  {
    id: "observation",
    label: "Beobachtung",
    shortLabel: "Fakt",
    description: "Nachprüfbare Feststellung aus Website, Prozessen oder öffentlich zugänglichen Quellen.",
  },
  {
    id: "assumption",
    label: "Annahme",
    shortLabel: "Ableitung",
    description: "Plausible Einordnung, wenn Daten fehlen — im Bericht transparent markiert.",
  },
  {
    id: "recommendation",
    label: "Empfehlung",
    shortLabel: "Maßnahme",
    description: "Konkrete Handlung mit Priorität und Aufwandseinschätzung — umsetzungsorientiert.",
  },
] as const;

export type AnalysisReportCategoryId = (typeof ANALYSIS_REPORT_CATEGORIES)[number]["id"];

/** KI-Vorteil — Website-Kommunikation */
export const ANALYSIS_AI_ADVANTAGE =
  "Unser intelligentes Analyse-System erstellt zunächst automatisch einen professionellen Analyseentwurf. Anschließend werden die Ergebnisse geprüft, ergänzt und für Ihr Unternehmen individuell bewertet.";
