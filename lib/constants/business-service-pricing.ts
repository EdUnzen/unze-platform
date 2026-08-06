/**
 * Servicepaket vs. Einzelauftrag nach Abnahme — Preislogik UNZE Business
 *
 * SSOT-Dokument: PROJEKTE/UNZE/SERVICEPAKET_PREISLOGIK.md
 * Anzeige: /business/servicepakete, /business/preise
 *
 * Regel: Keine öffentlichen Stundenlöhne — nur Paketpreise, Inklusiv-Leistungen & Rabatt.
 */

export const SERVICE_PRICING_MODEL = {
  headline: "Mit Servicepaket günstiger — ohne Paket nach Abnahme möglich",
  summary:
    "Im Projekt arbeiten wir gemeinsam bis zur Abnahme. Danach sind Änderungen weiterhin möglich — mit Servicepaket zu planbaren Konditionen, Inklusiv-Stunden und Paket-Rabatt; ohne Paket als Einzelauftrag zu Standard-Konditionen und ohne festen Zeitplan.",

  withProject: {
    title: "Im Projekt (bis zur Abnahme)",
    items: [
      "Gemeinsame Abstimmung, Tests und formale Abnahme",
      "Korrekturen innerhalb des vereinbarten Leistungsumfangs",
      "Kein laufender Support nach Abschluss — es sei denn, ein Servicepaket wird gebucht",
    ],
  },

  withServicepaket: {
    title: "Mit Servicepaket (nach Launch)",
    items: [
      "Paketpreis mit Inklusiv-Stunden je nach Stufe",
      "Rabatt auf Weiterarbeit über das Kontingent hinaus",
      "Priorisierte Bearbeitung je nach Paketstufe",
      "Planbare Betreuung: Wartung, Updates, Sicherheit, Anpassungen",
    ],
  },

  withoutServicepaket: {
    title: "Ohne Servicepaket (nach Abnahme)",
    items: [
      "Einzelaufträge weiterhin möglich — kein dauerhafter Support inklusive",
      "Standard-Konditionen ohne Paket-Rabatt",
      "Keine garantierte Priorität oder feste Reaktionszeiten",
      "Termine nach Verfügbarkeit — nicht wie bei Paket-Kunden planbar",
    ],
  },

  note:
    "Je mehr Systeme, Integrationen und Verwaltungsaufwand bei Ihnen anfallen, desto sinnvoller ist ein höheres Servicepaket. Verbindliche Konditionen und Rabatte stehen im Vertrag — nicht als öffentliche Stundensatz-Liste.",
} as const;

export const LEISTUNGEN_WE_OVERNEHMEN = {
  eyebrow: "Was wir für Sie übernehmen können",
  title: "Alles aus einer Hand — Preis im Projekt oder Servicepaket",
  intro:
    "Sie müssen keine Einzelposten buchen. Domain, Hosting, DNS, SSL, Stripe, Newsletter, SEO-Basis, Migration — wir können all das einrichten und dokumentieren. Der Preis ergibt sich aus Ihrem Projektumfang und später aus Ihrem Servicepaket.",
  groups: [
    {
      title: "Infrastruktur & Setup",
      items: ["Domain & DNS", "Hosting & SSL", "E-Mail-Einrichtung", "Deploy & Go-Live"],
    },
    {
      title: "Integration & Marketing",
      items: ["Stripe & Zahlungen", "WhatsApp & Newsletter", "SEO- & Performance-Basis", "Cookie-Banner"],
    },
    {
      title: "Betreuung & Weiterentwicklung",
      items: ["Updates & Sicherheit", "Kleinere Änderungen", "Erweiterungen", "Strategie & Optimierung"],
    },
  ],
  cta: "Im Projektgespräch klären wir, was Sie brauchen — und was ins Servicepaket gehört.",
} as const;
