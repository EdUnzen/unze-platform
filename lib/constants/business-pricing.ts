/**
 * UNZE Business — Preis-SSOT (Website + Studio + eBay-Orientierung)
 * Stand: 2026-07-22 · Landing individuell design — realistische Marktpreise
 */

export type StudioTierScope = {
  summary: string;
  /** Was der Kunde am Ende hat */
  included: readonly string[];
  /** Deine Aufgaben — Checkliste bei Auftrag */
  tasks: readonly string[];
  /** Explizit nicht enthalten — Upsell oder höhere Stufe */
  notIncluded: readonly string[];
  timeframe: string;
  revisions: string;
};

export type PriceTier = {
  name: string;
  /** Öffentliche Orientierung (Website, Anzeigen, Angebote) */
  price: string;
  /** Nur Studio / eBay — Datei-only, ohne Einrichtung */
  studioOnly?: string;
  period?: string;
  /** Kurztext Website / Tabelle */
  note: string;
  /** Studio: voller Leistungs- & Aufgaben-Scope */
  studioScope?: StudioTierScope;
  highlighted?: boolean;
};

export type PriceCategory = {
  id: string;
  title: string;
  description: string;
  href?: string;
  showIncluded?: boolean;
  tiers: PriceTier[];
};

/** Öffentliche Website — ohne Steuer-/Kleinunternehmer-Hinweise (s. STUDIO_COMPANY_PROFILE.vatNote für Angebote/Rechnungen) */
export const PRICING_DISCLAIMER =
  "Orientierungspreise (ab). Der verbindliche Preis wird nach Projektanalyse und Erstgespräch im individuellen Angebot festgelegt.";

/** Drei Preiswelten — kompakt für Hero / Übersicht */
export const PRICING_WORLDS = [
  {
    id: "template",
    title: "Template (Selbst)",
    from: "39,90 €",
    detail: "Nur Datei · eBay · ohne Einrichtung & Abnahme",
    icon: "file" as const,
  },
  {
    id: "project",
    title: "Werkstatt-Setup",
    from: "390 €",
    detail: "Designsystem-Referenz · Einrichtung · Abnahme durch UNZE",
    icon: "sparkles" as const,
  },
  {
    id: "service",
    title: "Servicepaket",
    from: "49,90 €",
    detail: "Optional · Wartung & Änderungen / Monat",
    icon: "shield" as const,
  },
] as const;

/** eBay / Studio-intern — nie als Projektpreis ausweisen */
export const EBAY_TEMPLATE_PRICING = [
  { id: "EB-K01", name: "Landingpage", price: "39,90 €", note: "1-Seiten-Template · nur Datei · Selbst-Einrichtung" },
  { id: "EB-K02", name: "Business-Website", price: "59 €", note: "Mehrseitig · nur Datei" },
  { id: "EB-K03", name: "Website + Admin", price: "99 €", note: "Public + Admin · nur Datei" },
  { id: "EB-A01", name: "Web-App Template", price: "149 €", note: "App-Grundgerüst · nur Datei" },
  { id: "EB-M05", name: "Modul Termin / Anfrage", price: "29 €", note: "Erweiterung für K02/K03" },
] as const;

const LANDING_STARTER_SCOPE: StudioTierScope = {
  summary:
    "Landingpage (One-Pager) im UNZE Designsystem — Referenz aus der Werkstatt, mit Ihren Inhalten eingerichtet. Kein Freihand-Design von Null.",
  included: [
    "1 Landingpage (Scroll-Struktur: Hero, Leistungen/Kurzinfo, Vertrauen, Kontakt/CTA)",
    "Branding-Anpassung: Farben, Logo, Typografie passend zur Branche (Werkstatt-Referenz)",
    "Responsive (Mobile, Tablet, Desktop)",
    "Kontaktformular oder feste Kontakt-Section (E-Mail/Telefon)",
    "Impressum- & Datenschutz-Link (Kunde liefert Texte oder Platzhalter-Hinweis)",
    "Technische Einrichtung im vereinbarten Hosting (oder Übergabe für Deploy)",
    "Kurze Einweisung / Abnahme (Video oder Telefon, ca. 15–20 Min.)",
  ],
  tasks: [
    "Kickoff: Briefing-Formular auswerten, Branchen-Template wählen (TBC)",
    "KURZPROFIL / Angebot: Stufe Starter bestätigen, Scope schriftlich fixieren",
    "Content: Texte & Bilder vom Kunden einpflegen (1 Korrekturrunde Texte)",
    "Design: Theme/ Tokens anpassen (Primary, Logo, Hero-Medien-Slot)",
    "Sektionen: Standard-Module befüllen (keine Sonder-Programmierung)",
    "Formular: Kontakt kanal testen (E-Mail / Demo-Hinweis)",
    "QA: Responsive, Links, Formular, Lighthouse-Basis",
    "Abnahme: Termin, Protokoll, Freigabe dokumentieren",
    "Go-Live: Deploy oder Übergabe-Paket",
  ],
  notIncluded: [
    "Mehrseitige Website, Blog, CMS",
    "Online-Termin, Shop, Admin-Bereich",
    "SEO-Audit, Google Ads, Texte schreiben (nur Einpflegen)",
    "Domain-Kauf (kann als Zusatzleistung)",
    "Animationen / Premium-Motion",
    "Unbegrenzte Revisionen",
  ],
  timeframe: "ca. 3–5 Werktage nach vollständigem Briefing",
  revisions: "1 Korrekturrunde Layout/Texte im vereinbarten Scope",
};

const LANDING_BUSINESS_SCOPE: StudioTierScope = {
  summary:
    "Ausführlichere Landingpage — Werkstatt-Basis plus SEO-Basis und Messbarkeit.",
  included: [
    "Alles aus Starter, plus:",
    "Erweiterte Sektionen (z. B. FAQ, Ablauf, Team-Kurz, Referenzen)",
    "Bis zu 3 logische Seitenbereiche oder 2 echte Unterseiten (z. B. Kontakt separat)",
    "SEO-Basis: Meta-Titel, Description, OG-Bild, sitemap-ready",
    "Analytics-Anbindung (z. B. Plausible / GA4 — Konto vom Kunden)",
    "Performance-Check vor Go-Live",
  ],
  tasks: [
    "Briefing & Struktur-Workshop (30 Min.)",
    "Wireframe / Sektionsplan abstimmen",
    "Individuelles Design über Standard hinaus (Layouts, Medien-Slots)",
    "SEO-Felder & Social Preview pflegen",
    "Analytics einbinden und testen",
    "2 Korrekturrunden",
    "Abnahme mit Checkliste (SEO + Formular + Mobile)",
    "Go-Live inkl. DNS-Hinweis falls nötig",
  ],
  notIncluded: [
    "Geschützter Admin / Buchungssystem (→ Website oder Business Core)",
    "Laufende SEO-Betreuung (→ Servicepaket)",
    "Professionelle Texterstellung / Fotoshooting",
    "Mehrsprachigkeit",
  ],
  timeframe: "ca. 5–8 Werktage",
  revisions: "2 Korrekturrunden im vereinbarten Scope",
};

const LANDING_PREMIUM_SCOPE: StudioTierScope = {
  summary:
    "Premium-Landing oder kampagnenstarke Seite — maximale gestalterische Individualität innerhalb der Werkstatt.",
  included: [
    "Alles aus Business, plus:",
    "Hochwertige Hero-Variante (Overlay, Video/ Bild-Slot, Premium-Tokens)",
    "Feinschliff Animation / Micro-Interactions (dezent, performance-aware)",
    "Erweiterte Trust-Elemente (Testimonials, Logo-Band, Stats)",
    "Optional: CMS-light oder editierbare Textblöcke (nach Absprache)",
    "Abnahme-Call ausführlicher + kurze Bedien-Doku (PDF/Video)",
  ],
  tasks: [
    "Design Intent / Referenzen abstimmen",
    "Premium-Modus & Medien-Briefing (TBC)",
    "Individuelle Sektions-Komposition (nicht nur Template-Default)",
    "Motion/ Hover-States wo sinnvoll",
    "Vollständiger QA- und Geräte-Test",
    "Abnahme + Dokumentation",
    "Go-Live + 14 Tage Bugfix kleiner Mängel im Scope",
  ],
  notIncluded: [
    "Komplexe Web-App, Login, Zahlungsflow",
    "Unbegrenzte Weiterentwicklung nach Abnahme",
    "Monatliche Content-Pflege ohne Servicepaket",
  ],
  timeframe: "ca. 8–12 Werktage",
  revisions: "2 Korrekturrunden + Feinschliff bis Abnahme im Scope",
};

const WEBSITE_STARTER_SCOPE: StudioTierScope = {
  summary:
    "Unternehmenswebsite (bis 5 Seiten) auf Basis des UNZE Design-Systems — Branchen-Referenz aus der Werkstatt, professionell eingerichtet.",
  included: [
    "Bis 5 Seiten + Impressum & Datenschutz (Kunde liefert Texte)",
    "Referenz-Layout aus Templates Business Core (Farben, Logo, Medien)",
    "Navigation, Leistungen, Über uns/Kurzprofil, Kontakt",
    "Kontaktformular oder feste Kontakt-Section",
    "Responsive · technische Einrichtung · Abnahme",
  ],
  tasks: [
    "Briefing & Branchen-Referenz wählen (TBC)",
    "Seitenstruktur fixieren (max. 5 Inhaltsseiten)",
    "Content einpflegen · Theme/Tokens anpassen",
    "Formular & rechtliche Links prüfen",
    "QA Responsive · Go-Live oder Übergabe",
    "Abnahme dokumentieren",
  ],
  notIncluded: [
    "Blog/News, Shop, Admin, Terminbuchung",
    "SEO-Basis & Analytics (→ Business)",
    "Mehrsprachigkeit, Sonder-Programmierung",
    "Texterstellung / Fotoshooting",
  ],
  timeframe: "ca. 5–8 Werktage nach vollständigem Briefing",
  revisions: "1 Korrekturrunde Layout/Texte im Scope",
};

const WEBSITE_BUSINESS_SCOPE: StudioTierScope = {
  summary:
    "Erweiterte Firmenwebsite — Werkstatt-Basis plus Blog/News, SEO-Basis und Messbarkeit. SEO kann bei Bedarf abgewählt werden (Gutschrift).",
  included: [
    "Alles aus Starter, plus:",
    "Erweiterte Struktur (bis ca. 10 Seitenbereiche)",
    "Blog- oder News-Bereich (einfach)",
    "SEO-Basis: Meta, OG, sitemap-ready",
    "Analytics-Anbindung (Konto vom Kunden)",
    "2 Korrekturrunden",
  ],
  tasks: [
    "Struktur-Workshop · Blog/News-Konzept",
    "SEO-Felder & Social Preview",
    "Analytics einbinden",
    "2 Korrekturrunden · Abnahme-Checkliste",
    "Go-Live inkl. DNS-Hinweis",
  ],
  notIncluded: [
    "Online-Shop, Login/Admin (→ Premium oder Business Core)",
    "Laufende SEO-Betreuung (→ Servicepaket)",
    "Mehrsprachigkeit (→ Premium)",
    "Individuelle Sonder-Architektur von Null",
  ],
  timeframe: "ca. 8–12 Werktage",
  revisions: "2 Korrekturrunden im vereinbarten Scope",
};

const WEBSITE_PREMIUM_SCOPE: StudioTierScope = {
  summary:
    "Individuelle Website-Architektur — Sonderstrukturen, Mehrsprachigkeit oder Premium-Module über den Werkstatt-Standard hinaus.",
  included: [
    "Alles aus Business, plus:",
    "Individuelle Informationsarchitektur (nicht nur Referenz-Clone)",
    "Mehrsprachigkeit (bis 2 Sprachen, nach Absprache)",
    "Erweiterte Module (z. B. Termin, Portal light)",
    "Premium-Feinschliff · ausführliche Abnahme & Doku",
  ],
  tasks: [
    "Design Intent / Sonderwünsche abstimmen",
    "Individuelle Sektions- & Seitenplanung",
    "Mehrsprachige Struktur (falls vereinbart)",
    "Vollständiger QA · Abnahme + Dokumentation",
    "Go-Live · 14 Tage Bugfix kleiner Mängel im Scope",
  ],
  notIncluded: [
    "Vollständige Web-App / Business Core (eigenes Projekt)",
    "Unbegrenzte Weiterentwicklung nach Abnahme",
    "Content-Pflege ohne Servicepaket",
  ],
  timeframe: "ca. 12–20 Werktage",
  revisions: "2 Korrekturrunden + Feinschliff bis Abnahme",
};

const BUSINESS_CORE_BASIC_SCOPE: StudioTierScope = {
  summary:
    "Business Core Basic — modulares Kernsystem aus der UNZE-Werkstatt: Dashboard, Kunden, Angebote, Rechnungen.",
  included: [
    "Business Core Instanz (TBC) — konfiguriert für den Kunden",
    "Module: Dashboard, Kundenverwaltung, Angebote, Rechnungen",
    "Rollen: Admin + Standard-Nutzer (nach Absprache)",
    "Branding: Logo, Farben, Firmenname",
    "Einrichtung, Tests, Abnahme, Kurz-Einweisung",
  ],
  tasks: [
    "Kickoff · KURZPROFIL · Modul-Scope Basic bestätigen",
    "Branchen-/Template-Basis wählen (TBC)",
    "Kundendaten-Struktur & Demo-Inhalte ersetzen",
    "Module aktivieren, Berechtigungen setzen",
    "PDF/Export-Pfade testen (Angebote/Rechnungen)",
    "QA Kernflows · Abnahme dokumentieren",
    "Go-Live / Zugang übergeben",
  ],
  notIncluded: [
    "Kalender, Mitarbeiter, KI, Portal, Automatisierung (→ Professional)",
    "Individuelle Neuentwicklung von Modulen",
    "Migration Altsystem (→ Zusatzleistung)",
    "Laufende Betreuung ohne Servicepaket",
  ],
  timeframe: "ca. 10–15 Werktage nach vollständigem Briefing",
  revisions: "1 Korrekturrunde Konfiguration/Layouts im Scope",
};

const BUSINESS_CORE_PRO_SCOPE: StudioTierScope = {
  summary:
    "Business Core Professional — erweiterte Module, Integrationen und Automatisierungen für wachsende Teams.",
  included: [
    "Alles aus Basic, plus:",
    "Erweiterte Module (Kalender, Dokumente, Automatisierung — nach Scope)",
    "Integrationen (E-Mail, ggf. WhatsApp/API light)",
    "Erweiterte Rollen & Workflows",
    "2 Korrekturrunden · ausführlichere Einweisung",
  ],
  tasks: [
    "Prozess-Workshop · Modulplan Professional",
    "Integrationen konfigurieren & testen",
    "Automatisierungen / Workflows einrichten",
    "Erweiterte QA · Performance-Basis",
    "Abnahme mit Checkliste je Modul",
    "Doku: Admin-Kurzanleitung",
  ],
  notIncluded: [
    "KI-Module, Enterprise-Skalierung (→ Enterprise)",
    "Vollständige ERP-Anbindung",
    "Native Mobile Apps",
  ],
  timeframe: "ca. 15–25 Werktage",
  revisions: "2 Korrekturrunden im vereinbarten Scope",
};

const BUSINESS_CORE_ENTERPRISE_SCOPE: StudioTierScope = {
  summary:
    "Business Core Enterprise — KI-Module, API, Premium-Setup und Skalierung für anspruchsvolle Prozesse.",
  included: [
    "Alles aus Professional, plus:",
    "KI-Module (Assistent, Dokumentenanalyse — nach Scope)",
    "API / Schnittstellen-Setup",
    "Premium-Setup, erweiterte Sicherheits- & Backup-Konfiguration",
    "Skalierungs-Architektur-Beratung im Projekt",
  ],
  tasks: [
    "Enterprise-Scope & API-Anforderungen fixieren",
    "KI-Module konfigurieren, Prompts/Flows abstimmen",
    "API-Dokumentation & Test-Endpunkte",
    "Security/Backup-Review",
    "Abnahme Enterprise-Checkliste",
    "Übergabe + optional Servicepaket-Empfehlung",
  ],
  notIncluded: [
    "Unbegrenzte Custom-Entwicklung nach Abnahme",
    "24/7-Support ohne Vertrag",
    "Compliance-Audit durch Dritte",
  ],
  timeframe: "ca. 25–40 Werktage",
  revisions: "2 Korrekturrunden + Feinschliff bis Abnahme",
};

const WEBAPP_MVP_SCOPE: StudioTierScope = {
  summary:
    "Web-App MVP — Kernfunktionen auf TBC/Werkstatt-Basis, schneller produktiver Start.",
  included: [
    "1 Kern-Workflow (z. B. Anfragen, Buchungen, internes Tool)",
    "Auth-Basis (Login, Rollen light)",
    "Responsive Web-App / PWA-ready (nach Stack)",
    "Admin-Bereich light",
    "Setup, Tests, Abnahme",
  ],
  tasks: [
    "MVP-Scope schriftlich fixieren (1 Kernprozess)",
    "TBC-Template / App-Grundgerüst wählen",
    "Datenmodell & UI an Kunde anpassen",
    "Kernflow implementieren/konfigurieren",
    "QA · Abnahme · Deploy",
  ],
  notIncluded: [
    "Native iOS/Android (→ Professional)",
    "Komplexe Payment/Multi-Tenant (→ Enterprise)",
    "Umfangreiche Integrationen",
  ],
  timeframe: "ca. 15–25 Werktage",
  revisions: "1 Korrekturrunde im MVP-Scope",
};

const WEBAPP_PRO_SCOPE: StudioTierScope = {
  summary: "Web-App Professional — erweiterte Features, Rollen, APIs und stabilere Architektur.",
  included: [
    "Alles aus MVP, plus:",
    "Mehrere Workflows / Module",
    "Erweiterte Rollen & Berechtigungen",
    "API-Anbindungen (nach Scope)",
    "Performance- & Security-Basis",
  ],
  tasks: [
    "Feature-Map Professional abstimmen",
    "Rollenkonzept umsetzen",
    "APIs integrieren & testen",
    "Erweiterte QA, Staging-Abnahme",
    "Go-Live + Kurzdoku",
  ],
  notIncluded: [
    "Enterprise-Skalierung, KI-Plattform (→ Enterprise)",
    "App-Store-Publishing Native",
  ],
  timeframe: "ca. 25–45 Werktage",
  revisions: "2 Korrekturrunden im Scope",
};

const WEBAPP_ENTERPRISE_SCOPE: StudioTierScope = {
  summary: "Web-App Enterprise — skalierbare Plattform mit KI, Integrationen und Premium-Betrieb.",
  included: [
    "Alles aus Professional, plus:",
    "Skalierbare Architektur, Multi-Rollen/Multi-Tenant light",
    "KI-Funktionen (nach Scope)",
    "Mehrere Integrationen / Webhooks",
    "Premium-Monitoring & Backup-Konzept",
  ],
  tasks: [
    "Enterprise-Architektur abstimmen",
    "KI-/Integrations-Roadmap im Projekt umsetzen",
    "Last- & Security-Review Basis",
    "Abnahme + Betriebsübergabe",
    "Servicepaket-Empfehlung dokumentieren",
  ],
  notIncluded: [
    "Unbegrenzte Feature-Entwicklung nach Abnahme",
    "Dediziertes 24/7 ohne SLA-Vertrag",
  ],
  timeframe: "ca. 45–70 Werktage",
  revisions: "2 Korrekturrunden + Feinschliff",
};

const MODULE_INTEGRATION_SCOPE: StudioTierScope = {
  summary: "Zusatzmodul Integrationen — E-Mail, WhatsApp, Schnittstellen an Business Core oder App.",
  included: [
    "1 Integrationspaket (z. B. E-Mail-Versand, Webhook, CRM-Bridge light)",
    "Konfiguration & Test",
    "Kurze Doku für Kunden-Admin",
  ],
  tasks: [
    "Integration spezifizieren",
    "Keys/Zugänge vom Kunden einrichten",
    "Testfälle durchspielen",
    "Abnahme dokumentieren",
  ],
  notIncluded: ["Komplexe ERP-Migration", "Mehrere Enterprise-Schnittstellen ohne Aufpreis"],
  timeframe: "ca. 3–7 Werktage",
  revisions: "1 Nachbesserungsrunde im Scope",
};

const MODULE_KI_SCOPE: StudioTierScope = {
  summary: "KI-Modul — Assistent, Dokumentenanalyse oder Workflow-Unterstützung.",
  included: [
    "1 KI-Use-Case im vereinbarten System",
    "Prompt/Flow-Konfiguration",
    "Test & Abnahme",
  ],
  tasks: [
    "Use-Case & Datenschutz abstimmen",
    "Modul konfigurieren",
    "Test mit Kundendaten (anonymisiert/demo)",
    "Abnahme",
  ],
  notIncluded: ["Eigenes ML-Training", "Unbegrenzte Token-Kosten des Kunden"],
  timeframe: "ca. 5–10 Werktage",
  revisions: "1 Korrekturrunde",
};

const MODULE_BRANCH_SCOPE: StudioTierScope = {
  summary: "Branchenmodul — branchenspezifische Erweiterung aus der UNZE-Werkstatt.",
  included: [
    "1 Branchenmodul (z. B. Termin, Angebot, Branchen-UI)",
    "Einrichtung passend zum Bestandssystem",
    "Test & Abnahme",
  ],
  tasks: [
    "Modul wählen & Scope fixieren",
    "Konfiguration & Content",
    "QA im Kontext der Instanz",
    "Abnahme",
  ],
  notIncluded: ["Vollständige Sonderprogrammierung", "Neues Branchen-Template von Null"],
  timeframe: "ca. 5–12 Werktage",
  revisions: "1 Korrekturrunde",
};

const SERVICE_BASIS_SCOPE: StudioTierScope = {
  summary: "Servicepaket Basis — technische Wartung monatlich (49,90 €/Monat).",
  included: [
    "Updates, Sicherheitspatches (Stack-abhängig)",
    "Backups prüfen",
    "Basis-Support (E-Mail, Werktags)",
    "Uptime/Monitoring light",
  ],
  tasks: [
    "Monatlich: Updates einspielen & testen",
    "Backup-Status prüfen",
    "Sicherheits-Hinweise beobachten",
    "Support-Tickets Basis bearbeiten",
  ],
  notIncluded: ["Inhaltliche Änderungen", "Neue Features", "Priorisierte SLA"],
  timeframe: "laufend · monatlich",
  revisions: "Keine Design-Korrekturrunden inkl.",
};

const SERVICE_BUSINESS_SCOPE: StudioTierScope = {
  summary: "Servicepaket Business — Priorität + kleinere Änderungen (99,90 €/Monat).",
  included: [
    "Alles aus Basis, plus:",
    "Priorisierter Support",
    "Kleinere inhaltliche/technische Anpassungen im Kontingent",
    "Performance-Checks periodisch",
  ],
  tasks: [
    "Monatlich: Wartung wie Basis",
    "Kleine Änderungen aus Ticket-Pool",
    "Performance-Quick-Check",
    "Kunden-Update bei relevanten Themen",
  ],
  notIncluded: ["Größere Features", "Neue Module", "Unbegrenzte Stunden"],
  timeframe: "laufend · monatlich",
  revisions: "Kleine Änderungen nach Vereinbarung",
};

const SERVICE_PREMIUM_SCOPE: StudioTierScope = {
  summary: "Servicepaket Premium — 3 h/Monat inkl., Weiterentwicklung (199,90 €/Monat).",
  included: [
    "Alles aus Business, plus:",
    "3 Inklusiv-Stunden/Monat",
    "Größere Anpassungen & Weiterentwicklung im Kontingent",
    "Paket-Rabatt auf Mehrstunden",
  ],
  tasks: [
    "Monatlich: Wartung + geplante Weiterarbeit",
    "Stunden dokumentieren",
    "Roadmap-Items aus Prioritätenliste",
    "Monats-Kurzbericht optional",
  ],
  notIncluded: ["Unbegrenzte Stunden", "Neues Großprojekt ohne Angebot"],
  timeframe: "laufend · monatlich",
  revisions: "Im Stundenkontingent",
};

const SERVICE_ENTERPRISE_SCOPE: StudioTierScope = {
  summary: "Servicepaket Enterprise — 1 h inkl. + bis 15 h/Monat vergünstigt (399,90 €/Monat).",
  included: [
    "1 Inklusiv-Stunde/Monat",
    "Bis 15 h/Monat zum Paket-Preis",
    "Dedizierter Ansprechpartner",
    "Erweiterte SLAs nach Vertrag",
  ],
  tasks: [
    "Monatliche Betreuung nach SLA",
    "Stunden & Prioritäten tracken",
    "Proaktive Wartung & Empfehlungen",
    "Quartals-Review optional",
  ],
  notIncluded: ["Unbegrenzte Entwicklung", "24/7 ohne Zusatzvereinbarung"],
  timeframe: "laufend · monatlich",
  revisions: "Nach Enterprise-Konditionen",
};

export const BUSINESS_PRICING: PriceCategory[] = [
  {
    id: "landingpages",
    title: "Landingpages",
    description:
      "Conversion-Seiten im UNZE Designsystem — Werkstatt-Referenz, eingerichtet und abgenommen (kein Template-Download).",
    showIncluded: true,
    tiers: [
      {
        name: "Starter",
        price: "ab 390 €",
        studioOnly: "39,90 € Template (nur Datei)",
        note: "1 Seite · Werkstatt-Referenz · Formular · Abnahme",
        studioScope: LANDING_STARTER_SCOPE,
      },
      {
        name: "Business",
        price: "ab 690 €",
        studioOnly: "59 € Template (nur Datei)",
        note: "Erweiterte LP · SEO-Basis · Analytics · 2 Korrekturen",
        studioScope: LANDING_BUSINESS_SCOPE,
        highlighted: true,
      },
      {
        name: "Premium",
        price: "ab 1.190 €",
        studioOnly: "99 € Template (nur Datei)",
        note: "Individuelles Design · Motion · Trust · ausführliche Abnahme",
        studioScope: LANDING_PREMIUM_SCOPE,
      },
    ],
  },
  {
    id: "websites",
    title: "Webseiten",
    description:
      "Mehrseitiger Unternehmensauftritt — Werkstatt-Setup auf Basis des UNZE Design-Systems (Referenz + Einrichtung).",
    showIncluded: true,
    tiers: [
      {
        name: "Starter",
        price: "ab 790 €",
        studioOnly: "59 € Template (nur Datei)",
        note: "Bis 5 Seiten · Werkstatt-Referenz · Formular · Abnahme",
        studioScope: WEBSITE_STARTER_SCOPE,
      },
      {
        name: "Business",
        price: "ab 1.290 €",
        studioOnly: "99 € Template (nur Datei)",
        note: "Blog/News · SEO-Basis inkl. · Analytics · 2 Korrekturen",
        studioScope: WEBSITE_BUSINESS_SCOPE,
        highlighted: true,
      },
      {
        name: "Premium",
        price: "ab 1.990 €",
        note: "Individuelle Architektur · Mehrsprachigkeit · Premium-Module",
        studioScope: WEBSITE_PREMIUM_SCOPE,
      },
    ],
  },
  {
    id: "business-core",
    title: "Business Core",
    description: "Modulare Unternehmenssoftware — Einmalpreis zzgl. optionalem Service.",
    href: "/business/business-core",
    showIncluded: true,
    tiers: [
      {
        name: "Basic",
        price: "ab 2.390 €",
        note: "Dashboard, Kunden, Angebote, Rechnungen",
        studioScope: BUSINESS_CORE_BASIC_SCOPE,
      },
      {
        name: "Professional",
        price: "ab 4.990 €",
        note: "Erweiterte Module, Integrationen, Automatisierung",
        highlighted: true,
        studioScope: BUSINESS_CORE_PRO_SCOPE,
      },
      {
        name: "Enterprise",
        price: "ab 8.499 €",
        note: "KI-Module, API, Premium-Setup, Skalierung",
        studioScope: BUSINESS_CORE_ENTERPRISE_SCOPE,
      },
    ],
  },
  {
    id: "webapps",
    title: "Apps (Web & Mobile)",
    description: "Web-Apps, PWAs, Portale und Mitarbeiter-Apps.",
    href: "/business/web-apps",
    showIncluded: true,
    tiers: [
      {
        name: "MVP",
        price: "ab 3.990 €",
        studioOnly: "149 € Template (nur Datei)",
        note: "Kernfunktionen, schneller Start",
        studioScope: WEBAPP_MVP_SCOPE,
      },
      {
        name: "Professional",
        price: "ab 7.990 €",
        note: "Erweiterte Features, Rollen, APIs",
        studioScope: WEBAPP_PRO_SCOPE,
      },
      {
        name: "Enterprise",
        price: "ab 12.900 €",
        note: "Skalierbare Plattform, KI, Integrationen",
        studioScope: WEBAPP_ENTERPRISE_SCOPE,
      },
    ],
  },
  {
    id: "modules",
    title: "Zusatzmodule",
    description: "Erweiterungen für Business Core und Apps.",
    tiers: [
      {
        name: "Integrationen",
        price: "ab 490 €",
        note: "E-Mail, WhatsApp, Schnittstellen",
        studioScope: MODULE_INTEGRATION_SCOPE,
      },
      {
        name: "KI-Module",
        price: "ab 1.390 €",
        note: "Assistent, Dokumentenanalyse",
        studioScope: MODULE_KI_SCOPE,
      },
      {
        name: "Branchenmodule",
        price: "ab 790 €",
        note: "Branchenspezifische Erweiterungen",
        studioScope: MODULE_BRANCH_SCOPE,
      },
    ],
  },
  {
    id: "service",
    title: "Servicepakete",
    description: "Technische Betreuung — freiwillig, mit günstigeren Konditionen.",
    href: "/business/servicepakete",
    tiers: [
      {
        name: "Basis",
        price: "49,90 €",
        period: "/ Monat",
        note: "Updates, Sicherheit, Basis-Support, Wartung",
        studioScope: SERVICE_BASIS_SCOPE,
      },
      {
        name: "Business",
        price: "99,90 €",
        period: "/ Monat",
        note: "Priorität, kleinere Änderungen, Performance",
        highlighted: true,
        studioScope: SERVICE_BUSINESS_SCOPE,
      },
      {
        name: "Premium",
        price: "199,90 €",
        period: "/ Monat",
        note: "3 h/Monat inkl. · Paket-Rabatt",
        studioScope: SERVICE_PREMIUM_SCOPE,
      },
      {
        name: "Enterprise",
        price: "399,90 €",
        period: "/ Monat",
        note: "1 h inkl. + bis 15 h/Monat vergünstigt",
        studioScope: SERVICE_ENTERPRISE_SCOPE,
      },
    ],
  },
];

export const ENTERPRISE_SERVICE_BENEFITS = [
  "1 Arbeitsstunde pro Monat inklusive",
  "Bis zu 15 Stunden/Monat zum vergünstigten Paket-Preis",
  "Danach gelten die vereinbarten Enterprise-Konditionen",
  "Dedizierter Ansprechpartner & erweiterte SLAs",
] as const;

export const APP_TYPES = [
  "Web-Apps",
  "Mobile Apps",
  "Progressive Web Apps (PWA)",
  "iOS & Android",
  "Kundenportale",
  "Mitarbeiter-Apps",
] as const;

/** Niedrigster Projekt-Einstieg — für Shop-Hinweise */
export const PROJECT_PRICE_FLOOR = {
  landing: "390",
  website: "790",
  webapp: "3.990",
} as const;
