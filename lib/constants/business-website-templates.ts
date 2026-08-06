/**
 * Webseiten-Branchen-Templates — Demo-Auftritte (Umzug, Reinigung, Arztpraxis)
 * Anonymisierte Demo-Firmen; Design wird individuell angepasst.
 */

import type { IndustryId } from "@/lib/constants/business-industry-scenarios";
import { DEMO_COMPANY_BY_INDUSTRY } from "@/lib/constants/demo-companies";

export type WebsiteTemplateId = Extract<IndustryId, "umzug" | "reinigung" | "arztpraxis">;

const WEBSITE_TEMPLATE_LABELS: Record<WebsiteTemplateId, { label: string; accent: string }> = {
  umzug: { label: "Umzugsunternehmen", accent: "from-emerald-500 to-teal-600" },
  reinigung: { label: "Reinigung & Hausmeister", accent: "from-sky-500 to-blue-600" },
  arztpraxis: { label: "Arztpraxis", accent: "from-teal-500 to-cyan-600" },
};

export type WebsiteTemplate = {
  id: WebsiteTemplateId;
  label: string;
  company: string;
  tagline: string;
  accent: string;
  heroBadge: string;
  heroTitle: string;
  heroSubline: string;
  primaryCta: string;
  secondaryCta: string;
  nav: readonly string[];
  stats: readonly { val: string; label: string }[];
  services: readonly { title: string; desc: string }[];
  trustLine: string;
};

export const WEBSITE_TEMPLATE_ORDER: WebsiteTemplateId[] = ["umzug", "reinigung", "arztpraxis"];

export const WEBSITE_TEMPLATES: Record<WebsiteTemplateId, WebsiteTemplate> = {
  umzug: {
    id: "umzug",
    label: WEBSITE_TEMPLATE_LABELS.umzug.label,
    company: DEMO_COMPANY_BY_INDUSTRY.umzug,
    tagline: "Privat- & Firmenumzüge im Rhein-Main-Gebiet",
    accent: WEBSITE_TEMPLATE_LABELS.umzug.accent,
    heroBadge: "Seit 2008 · Vollversichert",
    heroTitle: "Ihr Umzug — stressfrei geplant und sicher ausgeführt",
    heroSubline:
      "Online-Preisrechner, feste Ansprechpartner und erfahrene Teams. Von der Besichtigung bis zur Übergabe.",
    primaryCta: "Preisrechner starten",
    secondaryCta: "Besichtigung buchen",
    nav: ["Leistungen", "Preisrechner", "Referenzen", "Kontakt"],
    stats: [
      { val: "2.400+", label: "Umzüge / Jahr" },
      { val: "4.9★", label: "Kundenbewertung" },
      { val: "24h", label: "Angebotsantwort" },
    ],
    services: [
      { title: "Privatumzug", desc: "Packen, Transport, Montage — alles aus einer Hand." },
      { title: "Firmenumzug", desc: "IT, Möbel und Terminfenster — minimaler Ausfall." },
      { title: "Lagerung", desc: "Sichere Zwischenlagerung mit flexibler Dauer." },
    ],
    trustLine: "Festpreis nach Besichtigung · Versicherung inklusive · DACH-weit",
  },
  reinigung: {
    id: "reinigung",
    label: WEBSITE_TEMPLATE_LABELS.reinigung.label,
    company: DEMO_COMPANY_BY_INDUSTRY.reinigung,
    tagline: "Reinigung, Facility & Hausmeister — aus einer Hand",
    accent: WEBSITE_TEMPLATE_LABELS.reinigung.accent,
    heroBadge: "ISO-Qualität · Feste Teams",
    heroTitle: "Saubere Objekte. Zuverlässige Einsätze. Klare Verträge.",
    heroSubline:
      "Unterhalts- und Grundreinigung für Gewerbe, Praxen und Wohnanlagen — mit Qualitätsprotokollen und festen Ansprechpartnern.",
    primaryCta: "Objekt anfragen",
    secondaryCta: "Leistungen ansehen",
    nav: ["Leistungen", "Objekte", "Qualität", "Kontakt"],
    stats: [
      { val: "180+", label: "Objekte betreut" },
      { val: "98%", label: "SLA-Erfüllung" },
      { val: "18", label: "Einsatzteams" },
    ],
    services: [
      { title: "Unterhaltsreinigung", desc: "Büros, Praxen und Gewerbe — planbar und dokumentiert." },
      { title: "Grundreinigung", desc: "Intensivreinigung bei Übergabe oder Renovierung." },
      { title: "Hausmeister", desc: "Technik, Grünpflege und Störungsdienst für Wohnanlagen." },
    ],
    trustLine: "Qualitätsprotokolle · Feste Teams · Transparente Verträge",
  },
  arztpraxis: {
    id: "arztpraxis",
    label: WEBSITE_TEMPLATE_LABELS.arztpraxis.label,
    company: DEMO_COMPANY_BY_INDUSTRY.arztpraxis,
    tagline: "Hausarztmedizin & MVZ — persönlich und modern",
    accent: WEBSITE_TEMPLATE_LABELS.arztpraxis.accent,
    heroBadge: "Online-Termine · Same-Day",
    heroTitle: "Ihre Gesundheit — modern betreut und gut erreichbar",
    heroSubline:
      "Online-Terminbuchung, kurze Wartezeiten und ein Team, das Zeit für Ihre Anliegen nimmt.",
    primaryCta: "Termin online buchen",
    secondaryCta: "Sprechzeiten & Team",
    nav: ["Leistungen", "Team", "Termine", "Kontakt"],
    stats: [
      { val: "12.000+", label: "Patienten" },
      { val: "4", label: "Behandler" },
      { val: "Online", label: "Terminbuchung" },
    ],
    services: [
      { title: "Hausarzt", desc: "Vorsorge, Diagnostik und Behandlung für die ganze Familie." },
      { title: "Online-Termine", desc: "Termine buchen und verschieben — ohne Warteschleife." },
      { title: "MVZ-Leistungen", desc: "Ultraschall, Labor und Fachärzte unter einem Dach." },
    ],
    trustLine: "Kassen & privat · Barrierefrei · DSGVO-konforme Kommunikation",
  },
};

export type WebsitePageId = "home" | "services" | "contact";

export const WEBSITE_PAGES: { id: WebsitePageId; label: string }[] = [
  { id: "home", label: "Startseite" },
  { id: "services", label: "Leistungen" },
  { id: "contact", label: "Kontakt" },
];

export const WEBSITE_TEMPLATE_SHOWCASE: {
  id: WebsiteTemplateId;
  moduleLabel: string;
}[] = [
  { id: "umzug", moduleLabel: "Webseite — Umzug" },
  { id: "reinigung", moduleLabel: "Webseite — Reinigung & Hausmeister" },
  { id: "arztpraxis", moduleLabel: "Webseite — Arztpraxis" },
];

export const WEBSITE_TEMPLATES_INTRO = {
  eyebrow: "Webseiten-Templates",
  title: "Branchen-Webseiten auf Basis bewährter Vorlagen",
  lead:
    "Umzug, Reinigung, Hausmeister und Arztpraxis — dieselben Referenz-Branchen wie in Business Core. Professionelle Struktur, branchentypische Inhalte und individuell anpassbares Design für Ihre Anfragen.",
} as const;
