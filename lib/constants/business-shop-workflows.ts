/**
 * Shop- & Studio-Workflows — SSOT für Kundenablauf und interne Bearbeitung.
 * Governance: CORSA `04_Governance/Business_Shop_Studio_Orchestrierung.md` §10
 */

import type { ShopProduct, ShopProductType } from "@/lib/constants/business-shop-catalog";
import type { ShopCategoryId } from "@/lib/constants/business-shop-visuals";

/** active = läuft heute · planned = Voraussetzungen/APIs noch offen · manual = bewusst persönlich · partner = über Partner */
export type ShopWorkflowAutomation = "active" | "planned" | "manual" | "partner";

export type ShopWorkflowStep = {
  step: string;
  title: string;
  text: string;
  /** Wer handelt in diesem Schritt? */
  actor: "kunde" | "unze" | "system" | "partner";
  automation: ShopWorkflowAutomation;
  automationNote?: string;
};

export type ShopWorkflowDefinition = {
  id: string;
  title: string;
  summary: string;
  steps: ShopWorkflowStep[];
};

export const SHOP_WORKFLOW_AUTOMATION_LABEL: Record<ShopWorkflowAutomation, string> = {
  active: "Automatisiert",
  planned: "Automatisierung geplant",
  manual: "Persönlich durch UNZE",
  partner: "Partner-Einrichtung",
};

/** Gemeinsamer Rahmen — gilt für alle Shop-Leistungen */
export const SHOP_MASTER_WORKFLOW: ShopWorkflowDefinition = {
  id: "master",
  title: "So arbeiten wir — der einfache Weg",
  summary:
    "Jede Shop-Leistung folgt demselben logischen Ablauf: buchen, briefen, umsetzen, übergeben. Wo Automatisierung sinnvoll und technisch möglich ist, nutzen wir sie — sonst übernehmen wir persönlich. Sie brauchen kein Kundenportal.",
  steps: [
    {
      step: "01",
      title: "Leistung wählen & bezahlen",
      text: "Festpreis im Shop — sichere Zahlung über Stripe. Sofortige Bestätigung per E-Mail.",
      actor: "kunde",
      automation: "active",
      automationNote: "Auftrag wird in UNZE Studio angelegt, Bestätigungsmail an Kunde und Team.",
    },
    {
      step: "02",
      title: "Briefing oder Formular",
      text: "Link per E-Mail — je nach Leistung: Analyse-Fragebogen, Design-Briefing oder technische Angaben (Domain, Zugänge).",
      actor: "kunde",
      automation: "planned",
      automationNote: "Automatischer Briefing-Versand nach Zahlung — Formulare pro Produkttyp.",
    },
    {
      step: "03",
      title: "Umsetzung",
      text: "UNZE bearbeitet Ihren Auftrag im vereinbarten Zeitfenster. Partner-Leistungen koordinieren wir mit etablierten Anbietern.",
      actor: "unze",
      automation: "manual",
      automationNote: "Teilschritte (DNS, Deploy, Status) werden schrittweise automatisiert.",
    },
    {
      step: "04",
      title: "Freigabe & Übergabe",
      text: "Ergebnis zur Prüfung — Design, Konfiguration oder Bericht. Korrekturen im gebuchten Scope.",
      actor: "kunde",
      automation: "manual",
    },
    {
      step: "05",
      title: "Abschluss & Dokumentation",
      text: "Abschlussmail, optional Rechnung. Technische Dokumentation bei Setup-Leistungen.",
      actor: "system",
      automation: "planned",
      automationNote: "Status-Seite per Magic-Link und Abschlussmail — ohne Login.",
    },
  ],
};

export const SHOP_CATEGORY_WORKFLOWS: Partial<Record<ShopCategoryId, ShopWorkflowDefinition>> = {
  Analyse: {
    id: "analyse",
    title: "Analyse — Quick, Business, Premium",
    summary:
      "Nach der Zahlung erhalten Sie einen persönlichen Link zum Analyse-Formular. Der Bericht wird digital übermittelt — bei Premium zusätzlich ein Gespräch.",
    steps: [
      {
        step: "01",
        title: "Stufe wählen & bezahlen",
        text: "Quick, Business oder Premium — Preis und Umfang sind klar definiert.",
        actor: "kunde",
        automation: "active",
      },
      {
        step: "02",
        title: "Analyse-Formular",
        text: "Fragebogen mit Unternehmensdaten, Zielen und optionaler Website-URL.",
        actor: "kunde",
        automation: "active",
        automationNote: "Formular-Link nach Zahlung — Anbindung an shop_orders.",
      },
      {
        step: "03",
        title: "Auswertung & QA",
        text: "Strukturierte Analyse — KI-Entwurf bei Business/Premium, Qualitätsprüfung durch UNZE.",
        actor: "unze",
        automation: "planned",
        automationNote: "KI-Entwurf + QA-Workflow in Studio.",
      },
      {
        step: "04",
        title: "Bericht erhalten",
        text: "PDF und Empfehlungen per E-Mail. Gutschrift bei späterer Projektbeauftragung (Business/Premium).",
        actor: "system",
        automation: "planned",
        automationNote: "Bericht-Download per Magic-Link.",
      },
    ],
  },
  Templates: {
    id: "templates",
    title: "Websites & Designs (Business Core)",
    summary:
      "Kein Download. Sie wählen eine Stilrichtung aus Templates Business Core, liefern Inhalte im Briefing — UNZE erstellt Ihr individuelles Design im Designstudio.",
    steps: [
      {
        step: "01",
        title: "Template-Leistung buchen",
        text: "Landingpage, Business-Website oder Modul — Festpreis, klare Bearbeitungszeit.",
        actor: "kunde",
        automation: "active",
      },
      {
        step: "02",
        title: "Design-Briefing",
        text: "Stilrichtung (Referenz-Branche), Texte, Logo, Wunsch-Look, Zielgruppe.",
        actor: "kunde",
        automation: "planned",
        automationNote: "Briefing-Formular pro Template-Typ.",
      },
      {
        step: "03",
        title: "Design im UNZE Designstudio",
        text: "Individuelle Umsetzung auf Basis Business Core — Layout, Farben, Medien.",
        actor: "unze",
        automation: "manual",
      },
      {
        step: "04",
        title: "Freigabe & Feinschliff",
        text: "Vorschau zur Freigabe — Anpassungen im gebuchten Umfang.",
        actor: "kunde",
        automation: "manual",
      },
      {
        step: "05",
        title: "Go-Live (optional)",
        text: "Deploy und Domain-Anbindung als separate Einrichtungs-Leistung buchbar.",
        actor: "unze",
        automation: "planned",
        automationNote: "Deploy-Pipeline und Domain-Checkliste.",
      },
    ],
  },
  Infrastruktur: {
    id: "infrastruktur",
    title: "Domain, Hosting, DNS, SSL",
    summary:
      "Einrichtung über Partner-Anbieter. Wo APIs und Zugänge vorhanden sind, automatisieren wir — bei Sonderfällen persönliche Bearbeitung.",
    steps: [
      {
        step: "01",
        title: "Setup-Leistung buchen",
        text: "Domain-Einrichtung, Umzug, DNS, Hosting, SSL — Scope steht im Produkt.",
        actor: "kunde",
        automation: "active",
      },
      {
        step: "02",
        title: "Technisches Briefing",
        text: "Domain, Registrar-Zugang, Ziel-Hosting, E-Mail-Wünsche — strukturiertes Formular.",
        actor: "kunde",
        automation: "planned",
        automationNote: "Briefing mit Pflichtfeldern je Produkt.",
      },
      {
        step: "03",
        title: "Partner-Einrichtung",
        text: "Konfiguration bei Domain-Registrar, Hosting-Provider, DNS.",
        actor: "partner",
        automation: "partner",
        automationNote: "Registrar-/Hosting-APIs — schrittweise Anbindung geplant.",
      },
      {
        step: "04",
        title: "Prüfung & Dokumentation",
        text: "Funktionstest, SSL-Check, Übergabe der Zugangs- und DNS-Dokumentation.",
        actor: "unze",
        automation: "manual",
        automationNote: "Monitoring-Checks später automatisierbar.",
      },
    ],
  },
  Einrichtung: {
    id: "einrichtung",
    title: "Website-Einrichtung & Migration",
    summary:
      "Deploy, Domain-Anbindung und Go-Live für Ihre bei UNZE erstellte Website — Sie liefern Zugänge, wir setzen um.",
    steps: [
      {
        step: "01",
        title: "Einrichtung buchen",
        text: "Standard oder Pro — Umfang (Deploy, Inhalte, Anpassungen) ist im Produkt beschrieben.",
        actor: "kunde",
        automation: "active",
      },
      {
        step: "02",
        title: "Zugänge & Wünsche",
        text: "Hosting, Domain, CMS-Zugang, gewünschte Startseite — Briefing-Formular.",
        actor: "kunde",
        automation: "planned",
      },
      {
        step: "03",
        title: "Deploy & Anbindung",
        text: "Technische Einrichtung, Domain-Verknüpfung, SSL, Basis-Inhalte live.",
        actor: "unze",
        automation: "planned",
        automationNote: "Vercel/Deploy-Automatisierung wo möglich.",
      },
      {
        step: "04",
        title: "Abnahme & Go-Live",
        text: "Kurzer Check mit Ihnen — dann Freigabe und Abschlussdokumentation.",
        actor: "kunde",
        automation: "manual",
      },
    ],
  },
  Integration: {
    id: "integration",
    title: "Stripe, APIs, WhatsApp, Newsletter",
    summary: "Saubere Anbindung an Ihr System — Briefing mit Zugängen, Umsetzung und Test.",
    steps: [
      {
        step: "01",
        title: "Integration buchen",
        text: "Fest definierter Scope — z. B. Stripe Checkout, API-Anbindung, WhatsApp.",
        actor: "kunde",
        automation: "active",
      },
      {
        step: "02",
        title: "Zugänge bereitstellen",
        text: "API-Keys, Webhook-URLs, Test-Accounts — über sicheres Briefing.",
        actor: "kunde",
        automation: "planned",
      },
      {
        step: "03",
        title: "Anbindung & Test",
        text: "Implementierung, Testtransaktion oder Testnachricht, Fehlerbehandlung.",
        actor: "unze",
        automation: "manual",
      },
      {
        step: "04",
        title: "Übergabe",
        text: "Dokumentation der Konfiguration, Hinweise für den Betrieb.",
        actor: "unze",
        automation: "manual",
      },
    ],
  },
  Service: {
    id: "service",
    title: "Servicepakete & Wartung",
    summary: "Monatliche Betreuung — nach Buchung kurzes Onboarding, dann laufender Service im vereinbarten Umfang.",
    steps: [
      {
        step: "01",
        title: "Paket buchen",
        text: "Basis, Business oder Premium — monatliche Abrechnung über Stripe.",
        actor: "kunde",
        automation: "active",
        automationNote: "Abo-Verwaltung in Studio — Verlängerung geplant automatisiert.",
      },
      {
        step: "02",
        title: "Onboarding",
        text: "Kurzes Setup-Gespräch, Zugang zum Service-Kanal, Bestandsaufnahme.",
        actor: "unze",
        automation: "manual",
      },
      {
        step: "03",
        title: "Laufende Betreuung",
        text: "Checks, Updates, Support — planbar und dokumentiert.",
        actor: "unze",
        automation: "planned",
        automationNote: "SLA-Erinnerungen und Checklisten in Studio.",
      },
    ],
  },
};

const TYPE_WORKFLOW_OVERRIDES: Partial<Record<ShopProductType, ShopWorkflowStep[]>> = {
  servicepaket: SHOP_CATEGORY_WORKFLOWS.Service?.steps,
};

export function getShopWorkflowForProduct(product: ShopProduct): ShopWorkflowDefinition {
  const category = product.category as ShopCategoryId;
  const categoryFlow = SHOP_CATEGORY_WORKFLOWS[category];

  if (categoryFlow) {
    return {
      ...categoryFlow,
      title: product.name,
      summary: product.longDescription ?? product.shortDescription,
      steps: TYPE_WORKFLOW_OVERRIDES[product.type] ?? categoryFlow.steps,
    };
  }

  return {
    id: product.slug,
    title: product.name,
    summary: product.shortDescription,
    steps: SHOP_MASTER_WORKFLOW.steps.slice(0, 4),
  };
}

export function getShopProcessSteps(product: ShopProduct): ShopWorkflowStep[] {
  return getShopWorkflowForProduct(product).steps;
}

/** Studio-intern: gleiche Schritte als Checkliste */
export function getStudioOrderChecklist(productType: ShopProductType, category: string): ShopWorkflowStep[] {
  const categoryFlow = SHOP_CATEGORY_WORKFLOWS[category as ShopCategoryId];
  if (categoryFlow) return categoryFlow.steps;

  const generic: Record<ShopProductType, ShopWorkflowStep[]> = {
    analyse: SHOP_CATEGORY_WORKFLOWS.Analyse!.steps,
    template: SHOP_CATEGORY_WORKFLOWS.Templates!.steps,
    grund: SHOP_CATEGORY_WORKFLOWS.Infrastruktur!.steps,
    pauschal: SHOP_CATEGORY_WORKFLOWS.Einrichtung!.steps,
    servicepaket: SHOP_CATEGORY_WORKFLOWS.Service!.steps,
  };

  return generic[productType] ?? SHOP_MASTER_WORKFLOW.steps;
}

export const SHOP_WORKFLOW_CATEGORY_ORDER: ShopCategoryId[] = [
  "Analyse",
  "Templates",
  "Infrastruktur",
  "Einrichtung",
  "Integration",
  "Service",
];
