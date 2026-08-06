/**
 * Zentrale Referenz-Katalog — Qualitätsstandard v1.0
 *
 * REGEL: Die Business-Website (unze.app/business/*) ist Präsentationsplattform —
 * niemals Referenz. Erlaubt: eigenständige Produkte, TBC-Templates, Connect, Demos.
 */

import type { IndustryId } from "@/lib/constants/business-industry-scenarios";
import type { MockVariant } from "@/lib/constants/business-mock-types";
import {
  tbcScreenshotAlt,
  tbcScreenshotPath,
  TBC_TEMPLATE_ORDER,
  TBC_TEMPLATES,
  type TbcTemplateId,
  type TbcTemplatePageId,
} from "@/lib/constants/business-core-template-screenshots";
import { CONNECT_PLATFORM_SHOWCASE } from "@/lib/constants/business-connect-showcase";

export type ReferenceAsset = {
  src: string;
  alt: string;
};

export type ProductMockRef = {
  variant: MockVariant;
  industry?: IndustryId;
};

export function tbcReference(templateId: TbcTemplateId, page: TbcTemplatePageId = "home"): ReferenceAsset {
  return {
    src: tbcScreenshotPath(templateId, page),
    alt: tbcScreenshotAlt(templateId, page),
  };
}

/** UNZE Connect — eigenständiges Produkt */
export const CONNECT_REFERENCES = {
  discover: CONNECT_PLATFORM_SHOWCASE[0],
  dashboard: CONNECT_PLATFORM_SHOWCASE[1],
  community: CONNECT_PLATFORM_SHOWCASE[2],
} as const;

export type WebsiteReferenceItem = {
  templateId: TbcTemplateId;
  company: string;
  label: string;
  tagline: string;
  benefits: readonly string[];
  pages: readonly { page: TbcTemplatePageId; label: string }[];
};

export const WEBSITE_REFERENCE_SHOWCASE: WebsiteReferenceItem[] = TBC_TEMPLATE_ORDER.map((id) => {
  const t = TBC_TEMPLATES[id];
  return {
    templateId: id,
    company: t.company,
    label: t.label,
    tagline: t.tagline,
    benefits:
      id === "umzug"
        ? (["Conversion-orientiertes Design", "Mobile-first", "Klare Leistungsstruktur"] as const)
        : id === "reinigung"
          ? (["Vertrauensaufbau", "Objekt- & Leistungsfokus", "Professioneller Auftritt"] as const)
          : id === "hausmeister"
            ? (["Objektbetreuung im Fokus", "Schneller Kontakt", "Branchenspezifische Struktur"] as const)
            : (["Termin & Vertrauen", "MVZ-taugliches Design", "Barrierefreie Navigation"] as const),
    pages: [
      { page: "home", label: "Startseite" },
      { page: "kontakt", label: "Kontakt" },
    ] as const,
  };
});

export type LeistungReferenceItem = {
  id: string;
  title: string;
  caption: string;
  benefits: readonly string[];
  href: string;
} & (
  | { asset: ReferenceAsset; mock?: never }
  | { asset?: never; mock: ProductMockRef }
);

/** Je Leistung eine andere Referenz — keine Business-Website-Screenshots */
export const LEISTUNG_REFERENCE_SHOWCASE: LeistungReferenceItem[] = [
  {
    id: "webseiten",
    title: "Webseiten & Landingpages",
    caption: "TransWerk Umzug — Branchenvorlage Business Core",
    benefits: ["Corporate Sites", "Conversion-Design", "Mobile-first", "SEO-Basis"],
    href: "/business/webseiten",
    asset: tbcReference("umzug", "home"),
  },
  {
    id: "business-core",
    title: "Business Core",
    caption: "Muster Logistics GmbH — Dashboard & Unternehmenssteuerung (Demo)",
    benefits: ["Dashboard", "Kundenverwaltung", "Angebote & Rechnungen", "Module"],
    href: "/business/business-core",
    mock: { variant: "dashboard", industry: "umzug" },
  },
  {
    id: "apps",
    title: "Apps & Kundenportale",
    caption: "UNZE Connect — Discover & Plattform",
    benefits: ["Web-Apps", "PWA", "Self-Service", "Skalierbare Architektur"],
    href: "/business/web-apps",
    asset: CONNECT_REFERENCES.discover,
  },
  {
    id: "ki",
    title: "KI & Automatisierung",
    caption: "KI-Assistent in Business Core — Demo-Oberfläche",
    benefits: ["Dokumentenprozesse", "KI-Assistenten", "Automatisierung", "Integration"],
    href: "/business/ki-automatisierung",
    mock: { variant: "ai", industry: "umzug" },
  },
  {
    id: "analyse",
    title: "Unternehmensanalyse",
    caption: "Analytics & Kennzahlen — Auswertungslogik (Demo)",
    benefits: ["Website & Prozesse", "Priorisierte Maßnahmen", "Professioneller Bericht"],
    href: "/business/analyse",
    mock: { variant: "analytics", industry: "umzug" },
  },
  {
    id: "branchen",
    title: "Branchenlösungen",
    caption: "Glanzwerk Reinigung — Branchenvorlage Facility & Reinigung",
    benefits: ["Branchenmodule", "Schnellstart", "Skalierbar"],
    href: "/business/branchenloesungen",
    asset: tbcReference("reinigung", "home"),
  },
];

export const APP_REFERENCE_SHOWCASE = [
  {
    id: "connect-discover",
    title: "UNZE Connect",
    subtitle: "Community- & Netzwerkplattform — eigene Entwicklung",
    benefits: ["Discover & Communities", "Creator Dashboard", "Skalierbare Architektur"],
    asset: CONNECT_REFERENCES.discover,
  },
  {
    id: "connect-dashboard",
    title: "Creator Dashboard",
    subtitle: "Verwaltung, Analytics & Monetarisierung",
    benefits: ["Übersicht", "Mitgliederverwaltung", "Professionelle UI"],
    asset: CONNECT_REFERENCES.dashboard,
  },
  {
    id: "connect-community",
    title: "Community-Oberfläche",
    subtitle: "Öffentliche Gruppen & Events",
    benefits: ["Feed & Gruppen", "Events", "Mobile & Web"],
    asset: CONNECT_REFERENCES.community,
  },
] as const;

export type CategoryCardVisual =
  | { asset: ReferenceAsset }
  | { mock: ProductMockRef };

/** Kategorie-Karten — nur externe Referenzen oder Produkt-Demos */
export const LEISTUNG_CATEGORY_VISUALS: Record<string, CategoryCardVisual> = {
  "Business Core": { mock: { variant: "dashboard", industry: "umzug" } },
  "Webseiten & Landingpages": { asset: tbcReference("umzug", "home") },
  Apps: { asset: CONNECT_REFERENCES.discover },
  KI: { mock: { variant: "ai", industry: "umzug" } },
  Branchen: { asset: tbcReference("reinigung", "home") },
  "Analyse-Service": { mock: { variant: "analytics", industry: "umzug" } },
  "Betreuung & Service": { asset: tbcReference("hausmeister", "kontakt") },
};

export const BUSINESS_CORE_MODULE_REFERENCES: {
  label: string;
  description: string;
  mock: ProductMockRef;
}[] = [
  {
    label: "Dashboard & Steuerung",
    description: "KPIs, Pipeline und Tagesübersicht — das Zentrum Ihres Unternehmens.",
    mock: { variant: "dashboard", industry: "umzug" },
  },
  {
    label: "CRM & Kunden",
    description: "Kundenstamm, Historie und Ansprechpartner — alles an einem Ort.",
    mock: { variant: "customers", industry: "reinigung" },
  },
  {
    label: "Angebote & Rechnungen",
    description: "Vom Angebot bis zur Zahlung — durchgängiger Finanzprozess.",
    mock: { variant: "invoices", industry: "umzug" },
  },
  {
    label: "Planung & Kalender",
    description: "Termine, Einsätze und Ressourcen — teamübergreifend synchron.",
    mock: { variant: "calendar", industry: "arztpraxis" },
  },
];
