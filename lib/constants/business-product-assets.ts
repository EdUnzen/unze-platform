/**
 * Echte Produkt-Assets — Logos, Hero-Bilder, App-Screenshots.
 * Keine Unsplash-Platzhalter für eigene Produkte.
 */

/** UNZE-Markenzeichen — auch Marke von UNZE Connect */
export const UNZE_CONNECT_LOGO = {
  src: "/brand/unze-logo.png",
  alt: "UNZE — Logo der Plattform UNZE Connect",
} as const;

/** Offizielles My Organizer AI Produktbild (App-Icon) */
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

/**
 * My Organizer AI — bis echte App-Captures vorliegen:
 * keine Fake-Phone-UIs als Produktbeweis. Präsentation über Logo.
 */
export const ORGANIZER_PHONE_SHOWCASE: ProductPhoneShowcaseItem[] = [];
