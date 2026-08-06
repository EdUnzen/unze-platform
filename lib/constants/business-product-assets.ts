/**
 * Echte Produkt-Assets — Logos & Screenshots.
 */

/** Klares UNZE Connect Markenzeichen */
export const UNZE_CONNECT_LOGO = {
  src: "/brand/unze-connect-logo.png",
  alt: "UNZE Connect — offizielles Logo",
} as const;

/** Offizielles My Organizer AI App-Icon (Final Logo) */
export const MY_ORGANIZER_AI_HERO = {
  src: "/media/products/my-organizer-ai.png",
  alt: "My Organizer AI — offizielles App-Icon",
} as const;

/** Wordmark für klare Produktkennzeichnung */
export const MY_ORGANIZER_AI_WORDMARK = {
  src: "/media/products/my-organizer-ai-wordmark.png",
  alt: "My Organizer AI",
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

/** Echte My Organizer AI Oberflächen — Desktop-Referenzen, ruhig präsentiert */
export const ORGANIZER_PHONE_SHOWCASE: ProductPhoneShowcaseItem[] = [
  {
    id: "assistant",
    title: "Assistent",
    subtitle: "Chat & Aktionen",
    src: "/media/showcase/organizer/assistant.png",
    alt: "My Organizer AI — Assistent",
    fallbackVariant: "ai",
  },
  {
    id: "documents",
    title: "Dokumente",
    subtitle: "Ablage & Struktur",
    src: "/media/showcase/organizer/documents.png",
    alt: "My Organizer AI — Dokumente",
    fallbackVariant: "documents",
  },
  {
    id: "calendar",
    title: "Kalender",
    subtitle: "Termine & Planung",
    src: "/media/showcase/organizer/calendar.png",
    alt: "My Organizer AI — Kalender",
    fallbackVariant: "calendar",
  },
];
