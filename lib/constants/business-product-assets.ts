/**
 * Echte Produkt-Assets — Logos, Hero-Bilder, App-Screenshots.
 * Keine Unsplash-Platzhalter für eigene Produkte.
 */

export const UNZE_CONNECT_LOGO = {
  src: "/brand/unze-logo.png",
  alt: "UNZE Connect — offizielles Logo",
} as const;

/** Offizielles My Organizer AI Produktbild (Mascot / App-Icon) */
export const MY_ORGANIZER_AI_HERO = {
  src: "/media/products/my-organizer-ai.png",
  alt: "My Organizer AI — KI-Organizer für Dokumente, Termine und Aufgaben",
} as const;

export type ProductPhoneShowcaseItem = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  alt: string;
  fallbackVariant?: "documents" | "calendar" | "ai" | "community" | "dashboard";
  mockOnly?: boolean;
};

/** My Organizer AI — drei App-Screens (Mock-Fallback bis eigene Captures) */
export const ORGANIZER_PHONE_SHOWCASE: ProductPhoneShowcaseItem[] = [
  {
    id: "documents",
    title: "Dokumente",
    subtitle: "Scan, Ablage & Suche",
    src: "",
    alt: "My Organizer AI — Dokumentenübersicht",
    fallbackVariant: "documents",
    mockOnly: true,
  },
  {
    id: "assistant",
    title: "KI-Assistent",
    subtitle: "Chat & Aktionen",
    src: "",
    alt: "My Organizer AI — KI-Assistent",
    fallbackVariant: "ai",
    mockOnly: true,
  },
  {
    id: "calendar",
    title: "Termine",
    subtitle: "Planung & Erinnerungen",
    src: "",
    alt: "My Organizer AI — Termine & Aufgaben",
    fallbackVariant: "calendar",
    mockOnly: true,
  },
];
