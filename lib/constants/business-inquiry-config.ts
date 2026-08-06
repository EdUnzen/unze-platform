/** Konfiguration Projektanfrage — wiederverwendbar in Formular & E-Mails */

export const INQUIRY_INDUSTRIES = [
  "Handwerk & Bau",
  "Logistik & Transport",
  "Dienstleistung",
  "Einzelhandel & E-Commerce",
  "Beratung & Agentur",
  "Gesundheit & Pflege",
  "IT & Technologie",
  "Sonstige",
] as const;

export const INQUIRY_BUDGETS = [
  { value: "under_3k", label: "Unter 3.000 €" },
  { value: "3k_10k", label: "3.000 – 10.000 €" },
  { value: "10k_25k", label: "10.000 – 25.000 €" },
  { value: "25k_50k", label: "25.000 – 50.000 €" },
  { value: "over_50k", label: "Über 50.000 €" },
  { value: "flexible", label: "Noch offen / flexibel" },
] as const;

export const INQUIRY_MODULES = [
  { value: "dashboard", label: "Dashboard & Auswertungen" },
  { value: "customers", label: "Kundenverwaltung" },
  { value: "quotes", label: "Angebote & Rechnungen" },
  { value: "documents", label: "Dokumente & PDF" },
  { value: "calendar", label: "Kalender & Termine" },
  { value: "employees", label: "Mitarbeiterverwaltung" },
  { value: "automation", label: "Automatisierungen" },
  { value: "ai", label: "KI-Module" },
  { value: "integrations", label: "Integrationen (E-Mail, WhatsApp, API)" },
  { value: "portal", label: "Kundenportal / Web-App" },
] as const;

export const INQUIRY_TIMELINES = [
  { value: "asap", label: "So schnell wie möglich" },
  { value: "1_3m", label: "1–3 Monate" },
  { value: "3_6m", label: "3–6 Monate" },
  { value: "6m_plus", label: "6+ Monate" },
  { value: "flexible", label: "Flexibel" },
] as const;

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  analysis: "Unternehmensanalyse",
  business_core: "Business Core",
  website: "Webseite / Landingpage",
  webapp: "Web-App / Plattform",
  ai: "KI & Automatisierung",
  industry: "Branchenlösung",
  service: "Servicepaket / Wartung",
  other: "Sonstiges",
};

/** Wie der Kunde das Projekt betreiben möchte */
export const INQUIRY_SERVICE_MODELS = [
  { value: "project_only", label: "Einmaliges Projekt (ohne laufendes Paket)" },
  { value: "project_plus_service", label: "Projekt + Servicepaket (Wartung & Weiterentwicklung)" },
  { value: "service_only", label: "Nur Servicepaket / laufende Betreuung" },
  { value: "analysis_first", label: "Zuerst Analyse, dann Entscheidung" },
] as const;

/** Analyse-Stufe — Interesse im Formular */
export const INQUIRY_ANALYSIS_TIERS = [
  { value: "quick", label: "Quick Analyse (59,90 €)" },
  { value: "business", label: "Business Analyse" },
  { value: "premium", label: "Premium Analyse" },
  { value: "none", label: "Keine Analyse — direkt Projekt" },
] as const;

/** Servicepaket-Interesse */
export const INQUIRY_SERVICE_PACKAGES = [
  { value: "none", label: "Noch keins / Einzelauftrag" },
  { value: "basis", label: "Basis (49,90 €/Monat)" },
  { value: "business", label: "Business (99,90 €/Monat)" },
  { value: "premium", label: "Premium (199,90 €/Monat)" },
  { value: "enterprise", label: "Enterprise (399,90 €/Monat)" },
  { value: "undecided", label: "Noch unklar — Beratung gewünscht" },
] as const;

/** Hosting / Infrastruktur-Situation */
export const INQUIRY_HOSTING = [
  { value: "need_setup", label: "Einrichtung gewünscht (Domain, DNS, SSL, Deploy)" },
  { value: "have_own", label: "Eigene Infrastruktur vorhanden" },
  { value: "partial", label: "Teilweise vorhanden — Beratung nötig" },
  { value: "undecided", label: "Noch unklar" },
] as const;

/** Gewünschte Infrastruktur-Leistungen (Mehrfachauswahl) */
export const INQUIRY_INFRASTRUCTURE = [
  { value: "domain", label: "Domain & DNS" },
  { value: "hosting", label: "Hosting & SSL" },
  { value: "email", label: "E-Mail-Einrichtung" },
  { value: "stripe", label: "Zahlungen (Stripe)" },
  { value: "newsletter", label: "Newsletter / Marketing-Tools" },
  { value: "migration", label: "Migration bestehender Seite oder App" },
  { value: "seo", label: "SEO-Basis & Tracking" },
] as const;

/** Paket-Stufe — Anfrageformular & automatische Schätzung */
export const INQUIRY_PROJECT_TIERS = [
  { value: "starter", label: "Starter — Werkstatt-Setup (Designsystem-Referenz)" },
  { value: "business", label: "Business — erweiterter Umfang" },
  { value: "premium", label: "Premium — individuelles Design / Sonderstruktur" },
] as const;

export function projectTierToIndex(tier?: string | null): number {
  if (tier === "business") return 1;
  if (tier === "premium") return 2;
  return 0;
}

/** Website-Umfang — nur bei projectType website */
export const INQUIRY_WEBSITE_SCOPE = [
  { value: "landing", label: "Landingpage / One-Pager" },
  { value: "corporate", label: "Unternehmenswebsite (mehrere Seiten)" },
  { value: "shop", label: "Online-Shop / E-Commerce" },
  { value: "redesign", label: "Relaunch bestehender Website" },
] as const;
