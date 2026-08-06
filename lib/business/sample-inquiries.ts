import type { ProjectInquiryInput } from "@/lib/business/inquiry.service";

export type SampleInquiryScenario = {
  id: string;
  title: string;
  subtitle: string;
  expectedFactors: string[];
  input: ProjectInquiryInput;
};

/** Anonymisierte Test-Anfragen — E-Mails @example.com (keine Zustellung). */
export const SAMPLE_INQUIRY_SCENARIOS: SampleInquiryScenario[] = [
  {
    id: "handwerk-website",
    title: "Handwerk — Unternehmenswebseite",
    subtitle: "Einfaches Projekt, wenige Module, mittleres Budget",
    expectedFactors: [
      "Branche Handwerk (+4 %)",
      "Website Starter/Business",
      "2 Module (Kalender, Angebote)",
      "Zeitrahmen 1–3 Monate",
    ],
    input: {
      contactName: "Max Testmann",
      contactEmail: "sample-handwerk@example.com",
      company: "Muster Meisterbetrieb GmbH",
      industry: "Handwerk & Bau",
      phone: "+49 170 0000001",
      projectType: "website",
      budget: "3k_10k",
      timeline: "1_3m",
      preferredDate: "Ab September",
      modules: ["calendar", "quotes"],
      message:
        "Wir sind ein Meisterbetrieb mit 12 Mitarbeitern und brauchen eine moderne Webseite mit Leistungsübersicht, Kontaktformular und Termin-Anfrage. Referenzen und Teamvorstellung sollen leicht pflegbar sein. Google-Sichtbarkeit in der Region ist uns wichtig.",
    },
  },
  {
    id: "it-webapp-komplex",
    title: "IT — Web-App mit Integrationen",
    subtitle: "Komplex, ASAP, viele Module, API/Migration in der Beschreibung",
    expectedFactors: [
      "Branche IT (+10 %)",
      "Web-App MVP/Professional",
      "Hohe Integrationsdichte (+10 %)",
      "Komplexitäts-Keywords (API, Migration)",
      "Zeitrahmen ASAP (+15 %)",
    ],
    input: {
      contactName: "Alex Demo",
      contactEmail: "sample-it-webapp@example.com",
      company: "TechFlow Demo AG",
      industry: "IT & Technologie",
      phone: "+49 170 0000002",
      projectType: "webapp",
      budget: "10k_25k",
      timeline: "asap",
      modules: ["dashboard", "customers", "portal", "integrations", "automation"],
      message:
        "Wir planen eine Web-App für unsere Kunden mit Login-Bereich, Dashboard und API-Anbindung an unser Bestandssystem. Migration der bestehenden Excel-Prozesse ist erforderlich. Schnittstellen zu Stripe und E-Mail-Marketing sollen integriert werden. MVP in 8–10 Wochen wäre ideal, danach schrittweise Erweiterung mit Automatisierungen und Rollenverwaltung für mehrere Standorte.",
    },
  },
  {
    id: "dienstleistung-business-core",
    title: "Dienstleistung — Business Core",
    subtitle: "Mittlerer Umfang, 6 Module, höheres Budget, Compliance-Hinweis",
    expectedFactors: [
      "Business Core Professional/Enterprise",
      "6 Module → höhere Stufe",
      "Branche Dienstleistung (neutral)",
      "Compliance/DSGVO in Beschreibung",
      "Budget 25k–50k",
    ],
    input: {
      contactName: "Sandra Probe",
      contactEmail: "sample-dienstleistung@example.com",
      company: "ServicePro Nord (Demo)",
      industry: "Dienstleistung",
      phone: "+49 170 0000003",
      projectType: "business_core",
      budget: "25k_50k",
      timeline: "3_6m",
      modules: [
        "dashboard",
        "customers",
        "quotes",
        "documents",
        "calendar",
        "employees",
      ],
      message:
        "Als wachsende Dienstleistungsfirma suchen wir eine modulare Unternehmenssoftware für Kundenverwaltung, Angebote, Rechnungen und Mitarbeiterplanung. DSGVO-konforme Dokumentenablage und nachvollziehbare Prozesse sind Pflicht. Bestehende Abläufe sollen vereinheitlicht werden, ohne dass wir ein komplexes ERP brauchen. Schulung für 8 Nutzer und schrittweise Einführung über 3–4 Monate.",
    },
  },
];

export function getSampleScenarioById(id: string): SampleInquiryScenario | undefined {
  return SAMPLE_INQUIRY_SCENARIOS.find((s) => s.id === id);
}
