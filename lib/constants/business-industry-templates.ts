/**
 * Branchen-Templates — Referenzen & Demo-Flows (Priorität 2)
 * Standard: PROJEKTE/UNZE/DESIGNANALYSE_UNZE_BUSINESS_2026-07-16.md §8–9
 */

import type { MockVariant } from "@/lib/constants/business-mock-types";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";

export type IndustryTemplateStatus = "live" | "in-arbeit" | "geplant";

export type TemplateScreen = {
  id: string;
  label: string;
  variant: MockVariant;
  caption: string;
};

export type IndustryTemplate = {
  id: string;
  label: string;
  status: IndustryTemplateStatus;
  modules: readonly string[];
  /** Mock-Branche für live Templates */
  industryMock?: IndustryId;
  tagline: string;
  workflow: readonly { step: string; detail: string }[];
  screens: readonly TemplateScreen[];
};

export const INDUSTRY_TEMPLATES: readonly IndustryTemplate[] = [
  {
    id: "umzug",
    label: "Umzugsunternehmen",
    status: "live",
    industryMock: "umzug",
    tagline: "Disposition, Angebote, CRM und Fahrzeuge in einem System",
    modules: ["Disposition", "Angebote", "CRM", "Fahrzeuge", "Rechnungen", "Analytics"],
    workflow: [
      { step: "Anfrage", detail: "Kundenanfrage erfassen — online oder telefonisch." },
      { step: "Angebot", detail: "Kalkulation, Fotos, PDF — versenden und nachverfolgen." },
      { step: "Disposition", detail: "Touren, Fahrzeuge und Team planen." },
      { step: "Abrechnung", detail: "Rechnung, Zahlungsstatus, Auswertung." },
    ],
    screens: [
      { id: "dash", label: "Dashboard", variant: "dashboard", caption: "KPIs, Touren, Umsatz" },
      { id: "crm", label: "CRM", variant: "customers", caption: "Kunden & Kontakte" },
      { id: "offers", label: "Angebote", variant: "offers", caption: "Angebote & Aufträge" },
      { id: "cal", label: "Kalender", variant: "calendar", caption: "Disposition & Termine" },
      { id: "inv", label: "Rechnungen", variant: "invoices", caption: "Finanzen & Mahnwesen" },
      { id: "ai", label: "KI", variant: "ai", caption: "Assistent & Automatisierung" },
    ],
  },
  {
    id: "reinigung",
    label: "Reinigung & Hausmeister",
    status: "live",
    industryMock: "reinigung",
    tagline: "Objekte, Einsatzplanung, Qualität und Verträge",
    modules: ["Objekte", "Einsatzplan", "Qualität", "Verträge", "Marketing", "KI-Agent"],
    workflow: [
      { step: "Objekt", detail: "Gebäude, Flächen und Verträge anlegen." },
      { step: "Planung", detail: "Teams und Einsätze im Kalender verteilen." },
      { step: "Qualität", detail: "Protokolle, Fotos, Kundenfeedback." },
      { step: "Abrechnung", detail: "Leistungen, Rechnungen, Reporting." },
    ],
    screens: [
      { id: "dash", label: "Dashboard", variant: "dashboard", caption: "Objekte & Einsätze" },
      { id: "crm", label: "Kunden", variant: "customers", caption: "Facility-Kunden" },
      { id: "cal", label: "Einsatzplan", variant: "calendar", caption: "Teams & Schichten" },
      { id: "mkt", label: "Marketing", variant: "marketing", caption: "Leads & Kampagnen" },
      { id: "doc", label: "Dokumente", variant: "documents", caption: "Verträge & Protokolle" },
      { id: "ai", label: "KI-Agent", variant: "ai", caption: "Anfragen & Vorschläge" },
    ],
  },
  {
    id: "handwerk",
    label: "Handwerk & Fliesenleger",
    status: "live",
    industryMock: "handwerk",
    tagline: "Baustellen, Material, Angebote und Zeiterfassung",
    modules: ["Baustellen", "Angebote", "Material", "Zeiterfassung", "Dokumente"],
    workflow: [
      { step: "Anfrage", detail: "Kundenanfrage mit Fotos und Maßen." },
      { step: "Angebot", detail: "Kalkulation Material & Arbeitszeit." },
      { step: "Baustelle", detail: "Status, Team, Material auf der Baustelle." },
      { step: "Abschluss", detail: "Abnahme, Rechnung, Dokumentation." },
    ],
    screens: [
      { id: "dash", label: "Dashboard", variant: "dashboard", caption: "Baustellen-Übersicht" },
      { id: "offers", label: "Angebote", variant: "offers", caption: "Kalkulation & PDF" },
      { id: "crm", label: "Kunden", variant: "customers", caption: "Auftraggeber" },
      { id: "emp", label: "Team", variant: "employees", caption: "Mitarbeiter & Zeiten" },
      { id: "doc", label: "Dokumente", variant: "documents", caption: "Pläne & Fotos" },
      { id: "ana", label: "Analytics", variant: "analytics", caption: "Umsatz & Auslastung" },
    ],
  },
  {
    id: "elektriker",
    label: "Elektriker",
    status: "in-arbeit",
    industryMock: "handwerk",
    tagline: "Aufträge, Prüfprotokolle, Termine und Rechnungen",
    modules: ["Aufträge", "Prüfprotokolle", "Termine", "Rechnungen"],
    workflow: [
      { step: "Auftrag", detail: "Serviceauftrag mit Anlagen-Daten." },
      { step: "Prüfung", detail: "Protokoll, Fotos, Norm-Checkliste." },
      { step: "Termin", detail: "Monteur-Einsatz planen." },
      { step: "Rechnung", detail: "Leistung abrechnen." },
    ],
    screens: [
      { id: "dash", label: "Dashboard", variant: "dashboard", caption: "Offene Aufträge" },
      { id: "cal", label: "Termine", variant: "calendar", caption: "Monteur-Planung" },
      { id: "doc", label: "Protokolle", variant: "documents", caption: "Prüfberichte" },
      { id: "inv", label: "Rechnungen", variant: "invoices", caption: "Abrechnung" },
    ],
  },
  {
    id: "immobilien",
    label: "Immobilien",
    status: "geplant",
    tagline: "Objekte, Mieter, Dokumente und Reporting",
    modules: ["Objekte", "Mieter", "Dokumente", "Reporting"],
    workflow: [
      { step: "Objekt", detail: "Immobilie und Einheiten verwalten." },
      { step: "Mieter", detail: "Verträge, Kommunikation, Tickets." },
      { step: "Reporting", detail: "Kennzahlen und Cashflow." },
    ],
    screens: [
      { id: "dash", label: "Übersicht", variant: "dashboard", caption: "Portfolio-KPIs" },
      { id: "crm", label: "Mieter", variant: "customers", caption: "Verwaltung" },
      { id: "ana", label: "Reporting", variant: "analytics", caption: "Auswertungen" },
    ],
  },
  {
    id: "gastronomie",
    label: "Gastronomie",
    status: "geplant",
    tagline: "Reservierungen, Personal, Bestellungen und Auswertung",
    modules: ["Reservierungen", "Personal", "Bestellungen", "Auswertung"],
    workflow: [
      { step: "Reservierung", detail: "Tische und Gäste planen." },
      { step: "Service", detail: "Bestellungen und Küche koordinieren." },
      { step: "Auswertung", detail: "Umsatz pro Tag und Schicht." },
    ],
    screens: [
      { id: "dash", label: "Dashboard", variant: "dashboard", caption: "Tagesübersicht" },
      { id: "cal", label: "Reservierungen", variant: "calendar", caption: "Tischplan" },
      { id: "ana", label: "Auswertung", variant: "analytics", caption: "Umsatz & Trends" },
    ],
  },
  {
    id: "fitness",
    label: "Fitness & Studio",
    status: "geplant",
    tagline: "Mitglieder, Kurse, Verträge und Check-in",
    modules: ["Mitglieder", "Kurse", "Verträge", "Check-in"],
    workflow: [
      { step: "Mitglied", detail: "Vertrag und Zugang verwalten." },
      { step: "Kurs", detail: "Planung und Buchungen." },
      { step: "Check-in", detail: "Anwesenheit und Auslastung." },
    ],
    screens: [
      { id: "dash", label: "Studio", variant: "dashboard", caption: "Mitglieder live" },
      { id: "crm", label: "Mitglieder", variant: "customers", caption: "Verträge" },
      { id: "cal", label: "Kurse", variant: "calendar", caption: "Stundenplan" },
    ],
  },
  {
    id: "arztpraxis",
    label: "Arztpraxis",
    status: "live",
    industryMock: "arztpraxis",
    tagline: "Termine, Patientenakten, Abrechnung und Team",
    modules: ["Termine", "Patientenakten", "Abrechnung", "Team", "DMS", "KI-Agent"],
    workflow: [
      { step: "Termin", detail: "Online- und Telefon-Termine mit Warteliste." },
      { step: "Akte", detail: "Dokumentation, Befunde und Patientenhistorie." },
      { step: "Abrechnung", detail: "GOÄ/EBM, Status und Export." },
    ],
    screens: [
      { id: "dash", label: "Dashboard", variant: "dashboard", caption: "Praxis-Übersicht" },
      { id: "crm", label: "Patienten", variant: "customers", caption: "Stammdaten & Versicherung" },
      { id: "cal", label: "Termine", variant: "calendar", caption: "Behandler & Räume" },
      { id: "doc", label: "Akten", variant: "documents", caption: "Befunde & Dokumente" },
      { id: "inv", label: "Abrechnung", variant: "invoices", caption: "Finanzen & Export" },
      { id: "ai", label: "KI-Agent", variant: "ai", caption: "Anmeldung & Recall" },
    ],
  },
] as const;

export const INDUSTRY_TEMPLATES_INTRO = {
  eyebrow: "Branchen-Templates",
  title: "Referenz-Systeme — branchenspezifisch und erweiterbar",
  lead:
    "Jedes Template zeigt einen vollständigen Arbeitsablauf mit echten UI-Vorschauen. Live-Templates sind sofort als Referenz nutzbar — weitere Branchen folgen.",
} as const;

export const DEVELOPMENT_PORTFOLIO = {
  eyebrow: "Entwicklungsqualität",
  title: "So sieht unsere Software aus — aus echter Entwicklung",
  lead:
    "UNZE Business nutzt UI-Patterns aus UNZE Connect und eigenen Projekten: Communities, Verwaltung, Profile, CRM und Business-Module — anonymisiert als Referenz.",
  items: [
    {
      id: "community",
      title: "Community-Übersicht",
      text: "Verzeichnis, Karten, Filter und Badges — wie in UNZE Connect.",
      variant: "community" as MockVariant,
    },
    {
      id: "admin",
      title: "Administration",
      text: "Rollen, Moderation, Einstellungen — skalierbare Verwaltung.",
      variant: "admin" as MockVariant,
    },
    {
      id: "profile",
      title: "Profile & Creator",
      text: "Nutzerprofile, Statistiken, Events und Services.",
      variant: "profile" as MockVariant,
    },
    {
      id: "crm",
      title: "CRM & Business Core",
      text: "Kunden, Angebote, Rechnungen — das Herz der Unternehmenssoftware.",
      variant: "customers" as MockVariant,
    },
  ],
} as const;

export function getLiveTemplates(): IndustryTemplate[] {
  return INDUSTRY_TEMPLATES.filter((t) => t.status === "live" || t.status === "in-arbeit");
}
