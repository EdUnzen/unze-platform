/**
 * DEMO-UNTERNEHMEN (VERBINDLICHER STANDARD)
 *
 * Ausschließlich für öffentliche Mockups, Screenshots, Templates,
 * Präsentationen, Landingpages, Marketing und Beispielberichte.
 *
 * Richtlinie: PROJEKTE/UNZE/DEMO_UNTERNEHMEN.md
 *
 * Verboten öffentlich: echte Kunden, Pilotprojekte, interne Projektnamen,
 * produktive oder personenbezogene Daten.
 */

export const DEMO_COMPANIES = {
  musterLogistics: "Muster Logistics GmbH",
  nordCargo: "NordCargo GmbH",
  rheinTransport: "Rhein Transport GmbH",
  atlasServices: "Atlas Services GmbH",
  alphaDigital: "Alpha Digital Solutions",
  greenBuild: "GreenBuild Handwerk",
  musterConsulting: "Muster Consulting",
  beispielEcommerce: "Beispiel E-Commerce GmbH",
  praxisAmRhein: "Praxis am Rhein MVZ",
} as const;

export type DemoCompanyId = keyof typeof DEMO_COMPANIES;

export const DEMO_COMPANY_LIST: readonly string[] = Object.values(DEMO_COMPANIES);

/** Branchen-Mockups auf UNZE Business-Seiten */
export const DEMO_COMPANY_BY_INDUSTRY = {
  umzug: DEMO_COMPANIES.musterLogistics,
  reinigung: DEMO_COMPANIES.atlasServices,
  handwerk: DEMO_COMPANIES.greenBuild,
  arztpraxis: DEMO_COMPANIES.praxisAmRhein,
} as const;

/** Pflicht-Bereiche öffentlicher Analyse-Beispielberichte (Demo-Daten only) */
export const DEMO_ANALYSIS_REPORT_SECTIONS = [
  "Website-Analyse",
  "SEO",
  "Performance",
  "Benutzerfreundlichkeit",
  "Marketing",
  "Automatisierung",
  "KI-Potenzial",
  "Digitalisierungsgrad",
  "Roadmap",
  "Prioritäten (P0–P2)",
  "Handlungsempfehlungen",
  "Maßnahmenplan",
] as const;

/** Standard-Demo für öffentliche Analyse-Visualisierungen */
export const DEMO_ANALYSIS_REPORT = {
  company: DEMO_COMPANIES.musterLogistics,
  industry: "Logistik & Umzug",
  disclaimer:
    "Beispielbericht mit Demo-Daten — ausschließlich zur Darstellung der Analyse-Funktionen. Keine Rückschlüsse auf reale Unternehmen.",
} as const;

/** Kurz-Hinweis für UI-Fußnoten */
export const DEMO_DATA_DISCLAIMER =
  "Alle gezeigten Unternehmen und Daten sind Demo-Beispiele.";
