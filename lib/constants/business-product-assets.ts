/**
 * Echte Produkt-Assets — Logos, Hero-Bilder, App-Screenshots.
 * Keine Unsplash-Platzhalter für eigene Produkte.
 */

/** Klares UNZE Connect Markenzeichen (weiß auf schwarz) */
export const UNZE_CONNECT_LOGO = {
  src: "/brand/unze-connect-logo.png",
  alt: "UNZE Connect — offizielles Logo",
} as const;

/** Offizielles My Organizer AI App-Icon */
export const MY_ORGANIZER_AI_HERO = {
  src: "/media/products/my-organizer-ai.png",
  alt: "My Organizer AI — offizielles App-Icon",
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

/** Bis echte Organizer-App-Captures vorliegen: nur Logo, keine Fake-Phones */
export const ORGANIZER_PHONE_SHOWCASE: ProductPhoneShowcaseItem[] = [];
