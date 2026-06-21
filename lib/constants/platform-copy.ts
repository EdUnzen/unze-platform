/** Einheitliche Plattform-Texte — Startseite, Login, Discover */
export const PLATFORM_TAGLINE =
  "Communities verwalten, Gruppen organisieren, Events erstellen, Services anbieten \u2014 Auszeichnungen vergeben und Zertifikate sammeln.";

export const PLATFORM_DESCRIPTION =
  "UNZE vereint Communities, Gruppen, Events, Services, Auszeichnungen und Zertifikate auf einer Plattform \u2014 mit Verifizierung und Monetarisierung.";

/** Kernbereiche der Plattform — Marketing & Hero */
export const PLATFORM_PILLARS = [
  "Communities",
  "Gruppen",
  "Events",
  "Services",
  "Auszeichnungen",
  "Zertifikate",
] as const;

export const HOME_VALUE_PROPS = [
  {
    title: "Communities",
    description: "Erstellen, verwalten und mit Mitgliedern wachsen.",
    href: "/discover",
  },
  {
    title: "Gruppen",
    description: "Bereiche organisieren und gezielt freischalten.",
    href: "/discover?tab=groups",
  },
  {
    title: "Events",
    description: "Termine planen, Tickets und Check-in nutzen.",
    href: "/discover?tab=events",
  },
  {
    title: "Services",
    description: "Angebote und Dienstleistungen anbieten.",
    href: "/discover?tab=services",
  },
  {
    title: "Auszeichnungen",
    description: "Verdienste und Erfolge sichtbar machen.",
    href: "/profile/auszeichnungen",
  },
  {
    title: "Zertifikate",
    description: "Qualifikationen und Nachweise sammeln.",
    href: "/profile/auszeichnungen",
  },
] as const;

export const HOME_HERO_IMAGE = "/brand/unze-home-hero.png";

/** Gast-Startseite — dezentes Hintergrundmotiv (UI liefert alle Texte) */
export const GUEST_HERO_IMAGE = "/brand/unze-guest-hero.png";
