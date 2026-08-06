/**
 * Preis-Grundsatz UNZE Business — verbindlich für /business/preise und alle Preisangaben.
 *
 * Produktionsauftrag: PROJEKTE/UNZE/PREISSTRATEGIE_SERVICEPAKETE.md
 */

export const BUSINESS_PRICING_POLICY = {
  entryPriceLabel: "ab",
  entryPriceFull: "Einstiegspreis",

  headline: "Orientierung — klar und marktgerecht",
  subline:
    "Drei getrennte Preiswelten: Template ab 39,90 € · Werkstatt-Setup ab 390 € · Service optional ab 49,90 €/Monat.",

  disclaimer:
    "Der endgültige Preis richtet sich nach Projektumfang, Funktionsumfang, Anpassungen, Integrationen und Entwicklungsaufwand.",

  philosophy:
    "UNZE Business verkauft keine fertige Massenware — wir liefern professionell konfigurierte Softwarelösungen. Jedes Projekt wird vor der Auslieferung individuell geprüft, eingerichtet und gemeinsam abgenommen.",

  productTypes: {
    template: {
      title: "Template",
      summary: "Nur die Datei — ohne Einrichtung, Anpassungen, Support oder Abnahme.",
      idealFor: "Kunden, die alles selbst übernehmen möchten.",
    },
    individual: {
      title: "Werkstatt-Setup",
      summary:
        "Referenz aus dem UNZE Designsystem — Einrichtung mit Ihren Inhalten, Prüfung, Tests und gemeinsame Abnahme.",
    },
    enterpriseSoftware: {
      title: "Unternehmenssoftware",
      summary:
        "Business Core, CRM, Apps, Portale, Automatisierungen, KI und Schnittstellen — modular und skalierbar.",
    },
  },

  serviceNote:
    "Servicepakete sind freiwillig. Nach der Projekt-Abnahme sind Änderungen ohne Paket möglich — zu Standard-Konditionen und ohne festen Zeitplan. Mit Servicepaket: Inklusiv-Stunden, Rabatt auf Weiterarbeit, Priorisierung und planbare Betreuung.",

  afterAcceptance: {
    title: "Nach der Abnahme",
    withPaket: "Inklusiv-Stunden, Paket-Rabatt auf Weiterarbeit, Priorität — je nach Paketstufe.",
    withoutPaket:
      "Einzelaufträge möglich — Standard-Konditionen, keine garantierte Priorität, Termine nach Verfügbarkeit.",
  },

  communication: {
    avoid: "KI erstellt alles automatisch.",
    prefer:
      "Wir kombinieren moderne KI-Technologien mit eigener Entwicklung, Qualitätskontrolle und persönlicher Projektbetreuung.",
    quality: [
      "Jedes Projekt wird geprüft.",
      "Jedes Projekt wird getestet.",
      "Jedes Projekt wird gemeinsam mit dem Kunden abgenommen.",
    ],
  },

  calculationFactors: [
    "Projektumfang",
    "Funktionsumfang",
    "Anpassungen",
    "Integrationen",
    "Entwicklungsaufwand",
  ] as const,

  cta: "Individuelles Angebot anfragen",
  analysisNote:
    "Bei anschließender Projektbeauftragung rechnen wir den Analysebetrag zu 100 % an.",
} as const;

export const PRICE_INCLUDED_ITEMS = [
  "Planung",
  "Design",
  "Entwicklung",
  "Einrichtung",
  "Tests",
  "Optimierung",
  "gemeinsame Abnahme",
  "Dokumentation",
  "Einweisung",
] as const;

export const BUSINESS_WORKFLOW = {
  eyebrow: "UNZE Business — Arbeitsweise",
  title: "Keine Massenware — professionell konfigurierte Lösungen",
  lead:
    "Sie bestellen eine bewährte Grundlage — wir liefern erst nach individueller Prüfung, Einrichtung und gemeinsamer Abnahme. So entsteht eine Lösung, die wirklich zu Ihrem Unternehmen passt.",
  approachLine: "Beratung → Einrichtung → Test → gemeinsame Abnahme → langfristige Betreuung",
  steps: [
    {
      title: "Bestellung",
      items: [
        "Der Kunde bestellt ein System oder Modul.",
        "Das Produkt dient als bewährte Grundlage und wird nicht automatisch ausgeliefert.",
      ],
    },
    {
      title: "Individuelle Prüfung",
      items: [
        "Jedes Projekt wird nach der Bestellung erneut geprüft.",
        "Funktionen, Design und Kundenwünsche werden gemeinsam abgestimmt.",
        "Falls sinnvoll, werden zusätzliche Module empfohlen oder entfernt.",
      ],
    },
    {
      title: "Einrichtung und Anpassung",
      items: [
        "Installation und Konfiguration.",
        "Einbindung von Logo, Farben und Unternehmensdaten.",
        "Anpassung der vorhandenen Module an den jeweiligen Einsatzzweck.",
      ],
    },
    {
      title: "Qualitätssicherung",
      items: [
        "Sämtliche Funktionen werden getestet.",
        "Technische Fehler werden vor der Übergabe behoben.",
        "Erst wenn das System den Qualitätsstandards entspricht, geht es in die nächste Phase.",
      ],
    },
    {
      title: "Gemeinsame Abnahme",
      items: [
        "Präsentation per Videokonferenz oder Telefon.",
        "Der Kunde testet alle vereinbarten Funktionen.",
        "Änderungswünsche werden — soweit vom Auftrag umfasst — umgesetzt.",
      ],
    },
    {
      title: "Abschluss",
      items: [
        "Nach der erfolgreichen Abnahme erfolgt die Restzahlung.",
        "Anschließend beginnt — sofern gebucht — die laufende Betreuung im Rahmen eines Servicepakets.",
      ],
    },
  ],
} as const;

export const BUSINESS_PROCESSING_TIME = {
  eyebrow: "Bearbeitungszeit",
  title: "Realistische Zeitrahmen — abgestimmt auf Ihr Projekt",
  lead:
    "Da jedes System individuell geprüft und eingerichtet wird, hängt die Dauer vom Umfang ab — nicht von einem automatischen Versand.",
  tiers: [
    { label: "Standardmodule", duration: "ca. 3–5 Werktage" },
    { label: "Größere Systeme", duration: "5–10 Werktage" },
    { label: "Individuelle Entwicklungen", duration: "nach Absprache" },
  ],
} as const;

export const BUSINESS_WARRANTY = {
  eyebrow: "Gewährleistung & Haftung",
  title: "Gemeinsame Abnahme vor der endgültigen Übergabe",
  text:
    "Vor der endgültigen Übergabe erfolgt eine gemeinsame Abnahme. Dabei werden sämtliche vereinbarten Funktionen geprüft und getestet. Änderungs- oder Korrekturwünsche, die den vereinbarten Leistungsumfang betreffen und vor der Abnahme festgestellt werden, werden im Rahmen des Projekts berücksichtigt. Nach der Abnahme gelten die vereinbarten Vertrags- und Servicebedingungen.",
} as const;

/**
 * Leichte Kennzeichnung von Demo-/KI-Visuals (EU-Transparenz).
 * Kein Deepfake-Warnbanner — nur klare, ruhige Kennzeichnung.
 */
export const BUSINESS_MOCK_PREVIEW = {
  badge: "Demo · KI-gestützt",
  title: "Beispielansichten",
  text:
    "Manche Oberflächen und Illustrationen auf diesen Seiten sind Demo- oder KI-gestützte Darstellungen zur Orientierung — nicht die finale Auslieferung Ihres Systems.",
  footnote:
    "Demo- oder KI-gestützte Darstellung zur Orientierung — nicht die finale Auslieferung.",
} as const;

export const BUSINESS_PHILOSOPHY = {
  eyebrow: "Unternehmensphilosophie",
  title: "Nicht nur Software — sondern verlässliche Zusammenarbeit",
  lead:
    "Der Mehrwert von UNZE Business liegt in persönlicher Betreuung, hohem Qualitätsanspruch und transparenten Prozessen — nicht in anonymer Massenlieferung.",
  values: {
    title: "Was uns unterscheidet",
    items: [
      "Persönliche Betreuung statt Massenabfertigung.",
      "Jedes Projekt wird individuell geprüft und eingerichtet.",
      "Hoher Qualitätsanspruch vor der Übergabe.",
      "Transparente Kommunikation während der gesamten Umsetzung.",
      "Gemeinsame Abnahme statt einfacher Dateiübergabe.",
      "Langfristige Betreuung über optionale Servicepakete.",
    ],
  },
  kiPractice: {
    title: "Moderne Entwicklung — mit persönlicher Verantwortung",
    items: [
      "Bewährte Module und moderne KI-Tools als effiziente Grundlage",
      "Jedes Ergebnis wird geprüft, getestet und an Ihren Einsatz angepasst",
      "Kein anonymer Baukasten — persönliche Ansprechpartner durchgängig",
      "Gemeinsame Abnahme, bevor das Projekt als abgeschlossen gilt",
    ],
  },
  points: [
    "Professionell konfigurierte Software — keine fertige Massenware.",
    "Beratung, Einrichtung, Qualitätssicherung und Abnahme aus einer Hand.",
    "Jedes Projekt wird nach der Bestellung erneut geprüft und abgestimmt.",
    "Transparente Kommunikation und realistische Bearbeitungszeiten.",
    "Langfristige Partnerschaft — optional mit Servicepaketen nach dem Launch.",
  ],
  communication: BUSINESS_PRICING_POLICY.communication.prefer,
  tagline: BUSINESS_WORKFLOW.approachLine,
} as const;

export const PROJECT_ACCEPTANCE = {
  eyebrow: "Qualität & Abnahme",
  title: "Erst testen und abnehmen — dann ist das Projekt abgeschlossen",
  lead:
    "Vertrauen entsteht durch klare Prozesse. Deshalb gehören Qualitätssicherung und gemeinsame Abnahme fest zu jedem Projekt — nicht nur die Übergabe von Dateien.",
  steps: [
    {
      title: "Funktionstests",
      text: "Sämtliche vereinbarten Funktionen werden vor der Übergabe geprüft und technische Fehler behoben.",
    },
    {
      title: "Gemeinsame Testphase",
      text: "Sie testen das System im echten Einsatz — per Videokonferenz oder Telefon, begleitet durch UNZE Business.",
    },
    {
      title: "Korrekturen im Auftragsumfang",
      text: "Festgestellte Punkte innerhalb des vereinbarten Leistungsumfangs werden vor der Abnahme umgesetzt.",
    },
    {
      title: "Formale Abnahme",
      text: "Erst nach erfolgreicher Abnahme folgt die Restzahlung und — sofern gebucht — die laufende Betreuung.",
    },
  ],
  warrantyText: BUSINESS_WARRANTY.text,
} as const;

export const PRICING_EXPLAINER = {
  eyebrow: "Preisverständnis",
  title: "Warum diese Preise entstehen — und was Sie erwarten können",
  lead:
    "Orientierungspreise zeigen den Einstieg. Der finale Preis hängt von Umfang, Funktionen, Integrationen und Entwicklungsaufwand ab — transparent besprochen im Erstgespräch.",
  why: [
    "Professionell konfiguriert — keine automatische Massenlieferung",
    "Individuelle Prüfung und Abstimmung nach jeder Bestellung",
    "Einrichtung, Tests und gemeinsame Abnahme durch UNZE Business",
    "Dokumentation, Einweisung und optionale langfristige Betreuung",
  ],
  process: [
    { step: "Bestellung", detail: "Modul oder System als bewährte Grundlage — noch keine Auslieferung." },
    { step: "Prüfung", detail: "Funktionen, Design und Wünsche gemeinsam abstimmen." },
    { step: "Einrichtung", detail: "Konfiguration, Branding und Modulanpassung." },
    { step: "Qualität", detail: "Tests und Fehlerbehebung vor der Übergabe." },
    { step: "Abnahme", detail: "Gemeinsamer Test, Korrekturen, Restzahlung, Betreuung." },
  ],
} as const;

/** Mockup-Richtlinie — SSOT: business-mockup-standard.ts + CORSA Business_Mockup_Praesentations_Standard.md */
export { MOCKUP_DESIGN_DIRECTIVE } from "@/lib/constants/business-mockup-standard";

export function formatEntryPrice(amount: string): string {
  return `${BUSINESS_PRICING_POLICY.entryPriceLabel} ${amount}`;
}
