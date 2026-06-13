/** Einheitliche Plattform-Texte — Startseite, Login, Discover */
export const PLATFORM_TAGLINE =
  "Communities organisieren, verifizieren und monetarisieren — dein Netzwerk an einem Ort.";

export const PLATFORM_DESCRIPTION =
  "Die Plattform für Communities, Gruppen & Services — organisieren, verifizieren und monetarisieren.";

export const HOME_VALUE_PROPS = [
  {
    title: "Communities entdecken",
    description: "Finde Communities, die zu deinen Interessen passen.",
    href: "/discover",
  },
  {
    title: "Gruppen beitreten",
    description: "Tritt Gruppen bei, tausche dich aus und wachse gemeinsam.",
    href: "/discover?tab=groups",
  },
  {
    title: "Events erleben",
    description: "Entdecke Events in deiner Nähe und sei live dabei.",
    href: "/discover?tab=events",
  },
  {
    title: "Services nutzen",
    description: "Nutze Services und Angebote aus deiner Community.",
    href: "/discover?tab=services",
  },
] as const;

export const HOME_HERO_IMAGE = "/brand/unze-home-hero.png";

/** Gast-Startseite — reines Motiv ohne Text/Buttons (UI liefert Copy) */
export const GUEST_HERO_IMAGE = "/brand/unze-guest-hero.png";
