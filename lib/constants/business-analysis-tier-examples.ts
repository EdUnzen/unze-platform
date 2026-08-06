import type { AnalysisReportCategoryId } from "@/lib/constants/business-analysis-tiers";
import type { AnalysisTierId } from "@/lib/constants/business-analysis-tiers";
import { DEMO_COMPANIES } from "@/lib/constants/demo-companies";

export type TierExampleFinding = {
  categoryId: AnalysisReportCategoryId;
  text: string;
};

export type TierAnalysisExample = {
  tierId: AnalysisTierId;
  tierLabel: string;
  company: string;
  industry: string;
  priceDisplay: string;
  inputSummary: string;
  deliveryTime: string;
  reportVolume: string;
  executiveSummary: string;
  scores: { label: string; value: number; unit: string }[];
  reportSections: string[];
  findings: TierExampleFinding[];
  recommendations: string[];
  shopSlug: string;
};

export const DEMO_ANALYSIS_TIER_EXAMPLES: Record<AnalysisTierId, TierAnalysisExample> = {
  quick: {
    tierId: "quick",
    tierLabel: "Quick Analyse",
    company: DEMO_COMPANIES.atlasServices,
    industry: "Gebäudereinigung · Demo",
    priceDisplay: "59,90 €",
    inputSummary: "Website-URL, Branche, Kurzangaben — ausschließlich öffentliche Quellen",
    deliveryTime: "Automatisiert · Freigabe in der Regel innerhalb 48 Stunden",
    reportVolume: "8–12 Seiten · PDF-Bericht",
    executiveSummary:
      "Der öffentliche Auftritt wirkt vertrauenswürdig, hat aber auf Mobile deutliche Schwächen bei Ladezeit und Conversion. SEO-Grundlagen sind teilweise vorhanden — strukturierte Verbesserungen würden Sichtbarkeit und Anfragen spürbar erhöhen.",
    scores: [
      { label: "Website & Design", value: 68, unit: "%" },
      { label: "Mobile UX", value: 54, unit: "%" },
      { label: "SEO-Basis", value: 61, unit: "%" },
      { label: "Performance", value: 49, unit: "%" },
    ],
    reportSections: [
      "Executive Summary",
      "Website-Check",
      "Mobile Darstellung",
      "Benutzerführung",
      "SEO-Eindruck",
      "Performance",
      "Erste Empfehlungen",
    ],
    findings: [
      {
        categoryId: "observation",
        text: "Hero-Bereich auf iPhone 14: CTA „Angebot anfordern“ erst nach Scrollen sichtbar — hoher Absprung wahrscheinlich.",
      },
      {
        categoryId: "observation",
        text: "Ladezeit Startseite mobil gemessen bei 4,2 s — über üblichem Branchen-Richtwert.",
      },
      {
        categoryId: "assumption",
        text: "Leistungsseite ohne klare Preis- oder Paketstruktur — Interessenten brechen vermutlich vor Kontakt ab.",
      },
      {
        categoryId: "recommendation",
        text: "Mobile Hero mit fixiertem CTA und Click-to-Call — Priorität P1, geringer Aufwand.",
      },
    ],
    recommendations: [
      "Mobile Ladezeit unter 2,5 s bringen (Bilder, Caching)",
      "Leistungsübersicht mit 3 klaren Paketen ergänzen",
      "Lokale SEO-Signale (Google Business, Schema) prüfen",
    ],
    shopSlug: "analyse-quick",
  },
  business: {
    tierId: "business",
    tierLabel: "Business Analyse",
    company: DEMO_COMPANIES.musterLogistics,
    industry: "Logistik & Umzug · Demo",
    priceDisplay: "ab 249 €",
    inputSummary: "Website + ausführlicher Fragebogen (Prozesse, Software, Ziele, Teamgröße)",
    deliveryTime: "KI-Entwurf + persönliche Qualitätsprüfung · ca. 5–7 Werktage",
    reportVolume: "25–35 Seiten · Professioneller Bericht inkl. Maßnahmenplan",
    executiveSummary:
      "Das Unternehmen hat solide digitale Grundlagen, verliert aber im Tagesgeschäft Zeit durch manuelle Angebots- und Statusprozesse. Automatisierung und ein schlankes Kundenportal wären die stärksten Hebel — ROI innerhalb von 6–12 Monaten plausibel.",
    scores: [
      { label: "Digitalisierungsgrad", value: 62, unit: "%" },
      { label: "Automatisierungspotenzial", value: 74, unit: "%" },
      { label: "Marketing & Sichtbarkeit", value: 58, unit: "%" },
      { label: "Prozesseffizienz", value: 55, unit: "%" },
      { label: "KI-Einsatzpotenzial", value: 71, unit: "%" },
    ],
    reportSections: [
      "Executive Summary",
      "Website & Auftritt",
      "SEO & Performance",
      "Prozesse & Software",
      "Automatisierungspotenzial",
      "Business-Core-Module",
      "Prioritäten P0–P2",
      "Maßnahmenplan",
    ],
    findings: [
      {
        categoryId: "observation",
        text: "Fragebogen: Angebote werden in Word erstellt, Status per Telefon — durchschnittlich 45 Min. pro Anfrage.",
      },
      {
        categoryId: "observation",
        text: "Website generiert Leads, aber kein CRM — Nachverfolgung erfolgt per E-Mail-Ordner.",
      },
      {
        categoryId: "assumption",
        text: "Wiederkehrende Kundenanfragen zu Auftragsstatus deuten auf fehlendes Self-Service-Portal.",
      },
      {
        categoryId: "assumption",
        text: "Rechnungsstellung manuell — Schnittstelle zu Buchhaltung nicht vorhanden.",
      },
      {
        categoryId: "recommendation",
        text: "Digitales Angebotsformular mit Vorlagen und CRM-Anbindung — P1, hoher ROI.",
      },
      {
        categoryId: "recommendation",
        text: "Kundenportal für Status & Dokumente — P1, entlastet Telefon und E-Mail.",
      },
    ],
    recommendations: [
      "Angebotsprozess digitalisieren (Vorlagen, Freigabe, Versand)",
      "CRM für Lead- und Bestandskunden einführen",
      "Kundenportal für Auftragsstatus (Business Core Modul)",
      "Mobile Website-Conversion gezielt optimieren",
    ],
    shopSlug: "analyse-business",
  },
  premium: {
    tierId: "premium",
    tierLabel: "Premium Analyse",
    company: DEMO_COMPANIES.alphaDigital,
    industry: "IT-Dienstleistung · Demo",
    priceDisplay: "ab 490 €",
    inputSummary: "Fragebogen + persönliches Strategiegespräch + optional System-Zugänge (mit Zustimmung)",
    deliveryTime: "Individuelle Bearbeitung · ca. 10–14 Werktage inkl. Gespräch",
    reportVolume: "40–60 Seiten · Strategie, Roadmap & Umsetzungsangebot",
    executiveSummary:
      "Premium-Analyse für ein wachsendes IT-Unternehmen mit Fokus auf Skalierung: Vertrieb und Delivery sind eng verzahnt, aber nicht systemisch abgebildet. Dreijahres-Roadmap mit Business Core, Automatisierung und KI-Modulen — konkretes Umsetzungsangebot im Anhang.",
    scores: [
      { label: "Strategische Reife", value: 72, unit: "%" },
      { label: "Digitalisierungsgrad", value: 78, unit: "%" },
      { label: "Automatisierungspotenzial", value: 81, unit: "%" },
      { label: "Skalierbarkeit", value: 65, unit: "%" },
      { label: "KI-Readiness", value: 76, unit: "%" },
      { label: "Team & Prozesse", value: 69, unit: "%" },
    ],
    reportSections: [
      "Executive Summary",
      "Ist-Analyse & Gesprächsergebnisse",
      "Website, Marketing & Akquise",
      "Delivery & interne Prozesse",
      "Software-Landschaft",
      "Strategie & Zielbild",
      "Roadmap (12 / 24 / 36 Monate)",
      "Lösungskonzepte & Module",
      "Investition & ROI",
      "Umsetzungsangebot",
    ],
    findings: [
      {
        categoryId: "observation",
        text: "Strategiegespräch: Wachstumsziel +40 % Umsatz — Engpass ist manuelle Projektsteuerung, nicht Akquise.",
      },
      {
        categoryId: "observation",
        text: "Tools: Jira, HubSpot, Lexoffice — ohne durchgängige Datenkette zwischen Vertrieb und Delivery.",
      },
      {
        categoryId: "assumption",
        text: "KI-gestützte Angebotserstellung würde bei aktuellem Volumen ca. 12 h/Woche einsparen.",
      },
      {
        categoryId: "recommendation",
        text: "Phase 1 (Q1): CRM-Delivery-Integration + Kundenportal — Budgetrahmen im Angebot ausgewiesen.",
      },
      {
        categoryId: "recommendation",
        text: "Phase 2 (Q2–Q3): KI-Angebotsassistent + Reporting-Dashboard für Geschäftsführung.",
      },
    ],
    recommendations: [
      "12-Monats-Roadmap mit priorisierten Business-Core-Modulen",
      "Vertrieb-zu-Delivery-Workflow automatisiert abbilden",
      "KI-Modul für Angebotserstellung (Pilot in Phase 2)",
      "Individuelles Festpreis-Angebot für Phase 1 inkl. Gutschrift Analysebetrag",
    ],
    shopSlug: "analyse-premium",
  },
};

export const DEMO_ANALYSIS_TIER_ORDER: AnalysisTierId[] = ["quick", "business", "premium"];
