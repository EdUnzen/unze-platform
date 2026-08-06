/**
 * Demo-Inhalte für öffentliche Analyse-Landingpage (Beispielbericht)
 * Nur Demo-Daten — siehe DEMO_UNTERNEHMEN.md
 */

import { DEMO_ANALYSIS_REPORT, DEMO_ANALYSIS_REPORT_SECTIONS } from "@/lib/constants/demo-companies";

export const DEMO_ANALYSIS_SAMPLE_SCORES = [
  { label: "Digitalisierungsgrad", value: 62, unit: "%" },
  { label: "Automatisierungspotenzial", value: 74, unit: "%" },
  { label: "Marketing & Sichtbarkeit", value: 58, unit: "%" },
  { label: "KI-Einsatzpotenzial", value: 71, unit: "%" },
] as const;

export const DEMO_ANALYSIS_TOP_RECOMMENDATIONS = [
  "Kundenportal für Angebots- und Auftragsstatus einführen",
  "Angebotsprozess digitalisieren und Vorlagen automatisieren",
  "Mobile Darstellung der Website priorisieren (Conversion)",
  "CRM-Anbindung für wiederkehrende Kundenprozesse",
] as const;

export const DEMO_ANALYSIS_PROJECT_PATH = [
  { step: "Analyse", detail: "Stufe wählen, Daten erfassen, KI-Entwurf erstellen." },
  { step: "Bericht", detail: "Qualitätsprüfung, Freigabe, priorisierte Empfehlungen." },
  { step: "Strategie", detail: "Roadmap, Business-Core-Module, Aufwandseinschätzung." },
  { step: "Projekt", detail: "Individuelles Angebot — Analysebetrag anrechenbar." },
  { step: "Umsetzung", detail: "Entwicklung, Launch und optionale Betreuung." },
] as const;

/** Beispiel-Aussagen je Kategorie — zeigt Mehrwert & Struktur im Bericht */
export const DEMO_ANALYSIS_TRANSPARENCY_EXAMPLES = [
  {
    categoryId: "observation" as const,
    text: "Die Website lädt auf Mobile über 4 Sekunden; zentrale CTAs liegen unter dem sichtbaren Bereich.",
  },
  {
    categoryId: "observation" as const,
    text: "Im Footer fehlt ein verlinktes Datenschutzdokument trotz aktivem Kontaktformular.",
  },
  {
    categoryId: "assumption" as const,
    text: "Angebote werden vermutlich manuell erstellt — keine Online-Schnittstelle oder Kundenportal erkennbar.",
  },
  {
    categoryId: "assumption" as const,
    text: "Wiederkehrende Status-Anfragen deuten auf fehlende Self-Service-Option für Bestandskunden.",
  },
  {
    categoryId: "recommendation" as const,
    text: "Mobile Navigation und Hero-CTA überarbeiten — Priorität P1, mittlerer Aufwand, hoher Conversion-Effekt.",
  },
  {
    categoryId: "recommendation" as const,
    text: "Digitales Angebotsformular mit CRM-Anbindung einführen — P1, reduziert manuelle Nachfragen deutlich.",
  },
] as const;

/** Inhaltsverzeichnis — zeigt Umfang & Professionalität des Berichts */
export const DEMO_ANALYSIS_REPORT_OUTLINE = [
  { section: "Executive Summary", detail: "Kernaussagen auf einer Seite" },
  { section: "Website & Auftritt", detail: "Design, UX, Mobile, Vertrauen" },
  { section: "SEO & Performance", detail: "Sichtbarkeit, Ladezeit, Technik" },
  { section: "Prozesse & Software", detail: "Angebote, CRM, Automatisierung" },
  { section: "Digitalisierung & KI", detail: "Potenziale, Module, Quick Wins" },
  { section: "Prioritäten & Roadmap", detail: "P0–P2, Phasen, Aufwand" },
  { section: "Maßnahmenplan", detail: "Konkrete nächste Schritte" },
] as const;

/** Prioritäten-Matrix — zeigt Umsetzungslogik im Bericht */
export const DEMO_ANALYSIS_PRIORITY_ITEMS = [
  {
    priority: "P0" as const,
    title: "Mobile Conversion & Ladezeit",
    detail: "Hero-CTA, Bildoptimierung, Core Web Vitals — direkter Einfluss auf Anfragen.",
    effort: "Mittel",
    impact: "Hoch",
    timeline: "0–4 Wochen",
  },
  {
    priority: "P1" as const,
    title: "Digitales Angebotsformular + CRM",
    detail: "Vorlagen, Freigabe, Nachverfolgung — reduziert manuelle Angebotszeit deutlich.",
    effort: "Mittel",
    impact: "Hoch",
    timeline: "4–10 Wochen",
  },
  {
    priority: "P1" as const,
    title: "Kundenportal für Auftragsstatus",
    detail: "Self-Service für Bestandskunden — entlastet Telefon und E-Mail.",
    effort: "Hoch",
    impact: "Hoch",
    timeline: "8–14 Wochen",
  },
  {
    priority: "P2" as const,
    title: "KI-gestützte Angebotserstellung",
    detail: "Pilotmodul nach CRM-Integration — Skalierung bei wachsendem Volumen.",
    effort: "Hoch",
    impact: "Mittel",
    timeline: "3–6 Monate",
  },
] as const;

/** Roadmap-Phasen — Premium-/Business-Bericht */
export const DEMO_ANALYSIS_ROADMAP_PHASES = [
  {
    phase: "Phase 1",
    window: "Monat 1–3",
    focus: "Quick Wins & Conversion",
    items: ["Mobile UX", "Angebotsformular", "CRM-Grundlage"],
  },
  {
    phase: "Phase 2",
    window: "Monat 4–8",
    focus: "Prozesse & Portal",
    items: ["Kundenportal", "Status-Workflows", "Reporting"],
  },
  {
    phase: "Phase 3",
    window: "Monat 9–12",
    focus: "Automatisierung & KI",
    items: ["Angebots-Assistent", "Dashboards", "Skalierung"],
  },
] as const;

export { DEMO_ANALYSIS_REPORT, DEMO_ANALYSIS_REPORT_SECTIONS };
