/**
 * Eigene Softwareprodukte von UNZE Business — getrennt vom Leistungsportfolio.
 *
 * Standard: PROJEKTE/UNZE/PRODUKTARCHITEKTUR.md
 */

export type OwnProductId = "unze-connect" | "my-organizer-ai";

export type OwnProductAvailability = "available" | "discontinued";

export type OwnProductReferenceArea = {
  label: string;
  description: string;
};

export type OwnProduct = {
  id: OwnProductId;
  name: string;
  tagline: string;
  description: string;
  statusLabel: string;
  availability: OwnProductAvailability;
  /** Hinweis, wenn das Produkt nicht mehr für neue Kunden angeboten wird */
  availabilityNote?: string;
  /** Öffentliche Produkt-URL — optional */
  href?: string;
  hrefLabel?: string;
  referenceAreas?: readonly OwnProductReferenceArea[];
  highlights: readonly string[];
};

export function isOwnProductDiscontinued(product: Pick<OwnProduct, "availability">): boolean {
  return product.availability === "discontinued";
}

export const OWN_PRODUCTS_INTRO = {
  eyebrow: "Unsere Produkte",
  title: "Eigene Software — entwickelt von UNZE Business",
  lead:
    "UNZE Business ist Softwareunternehmen und Studio. Neben individuellen Kundenprojekten entwickeln wir eigene Produkte. Diese sind eigenständige Software — kein Modul von Business Core und keine Dienstleistungspakete.",
  referenceNote:
    "Die folgenden Produkte dienen als Referenz für unsere Entwicklungsqualität — nicht als Ersatz für maßgeschneiderte Unternehmenslösungen.",
  connectProof:
    "Diese Plattform wurde von UNZE Business entwickelt — ein Nachweis für skalierbare Software, nicht Community-Werbung.",
} as const;

export const UNZE_OWN_PRODUCTS: readonly OwnProduct[] = [
  {
    id: "unze-connect",
    name: "UNZE Connect",
    tagline: "Community- und Netzwerkplattform",
    description:
      "Vollständige Plattform für Communities, Creator, Events, Verwaltung und Monetarisierung — mit Dashboard, Profilen, Gruppen und Analytics.",
    statusLabel: "Eigenes Produkt von UNZE Business",
    availability: "available",
    href: "https://www.unze.app/communities",
    hrefLabel: "Plattform ansehen",
    referenceAreas: [
      { label: "Dashboard", description: "Creator- und Admin-Übersicht" },
      { label: "Community", description: "Gruppen, Feed, Mitgliederverwaltung" },
      { label: "Events", description: "Termine und Veranstaltungen" },
      { label: "Profile", description: "Nutzer- und Creator-Profile" },
      { label: "Analytics", description: "Auswertungen und Kennzahlen" },
      { label: "Creator-Bereich", description: "Monetarisierung und Tools" },
      { label: "Verwaltung", description: "Rollen, Moderation, Einstellungen" },
      { label: "Benachrichtigungen", description: "Echtzeit-Updates für Nutzer" },
    ],
    highlights: ["Skalierbare Architektur", "Mobile & Web", "Creator-Ökosystem"],
  },
  {
    id: "my-organizer-ai",
    name: "My Organizer AI",
    tagline: "Nicht mehr für neue Kunden verfügbar",
    description:
      "Intelligenter Organizer für Dokumente, Termine, Aufgaben und digitale Ablage — mit KI-gestützter Strukturierung und durchsuchbarer Wissensbasis.",
    statusLabel: "Nicht mehr verfügbar",
    availability: "discontinued",
    availabilityNote:
      "My Organizer AI wird aufgrund einer neuen Ausrichtung nicht mehr für neue Kunden angeboten. Bestehende Kunden behalten ihren Zugang.",
    highlights: [
      "Dokumenten-Scan & Ablage",
      "Termine & Aufgaben",
      "KI-Vorschläge",
      "Persönliche Organisation",
    ],
  },
] as const;

/** Leistungs-Reihenfolge laut PRODUKTARCHITEKTUR §3 */
export const SERVICES_DISPLAY_ORDER = [
  "business-core",
  "webseiten",
  "web-apps",
  "ki",
  "branchen",
  "analyse",
] as const;
