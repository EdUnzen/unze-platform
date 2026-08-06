/** Einheitliche Plattform-Texte — Startseite, Login, Discover, Onboarding, Marketing */

/** Kanonische Tagline — überall identisch (Landing, App, Screenshots, Onboarding). */
export const PLATFORM_TAGLINE =
  "Communities verwalten, Gruppen organisieren, Events erstellen, Services anbieten, Auszeichnungen vergeben und Zertifikate sammeln.";

export const PLATFORM_TAGLINE_WITH_CONTEXT = `UNZE bündelt alles an einem Ort: ${PLATFORM_TAGLINE}`;

export const PLATFORM_TAGLINE_WITH_VERIFICATION = `${PLATFORM_TAGLINE_WITH_CONTEXT} — mit Verifizierung und Monetarisierung.`;

/** Kurzliste der Kernbereiche — Navigation, Onboarding, Seiten-Subtitles. */
export const PLATFORM_PILLAR_LIST =
  "Communities, Gruppen, Events, Services, Auszeichnungen und Zertifikate";

export const PLATFORM_PILLAR_LIST_SHORT =
  "Communities, Gruppen, Events, Services, Auszeichnungen & Zertifikate";

export const PLATFORM_SUBTITLE_ONBOARDING = `${PLATFORM_PILLAR_LIST} — auf einer Plattform.`;

export const MEMBER_HUB_SUBTITLE = `${PLATFORM_PILLAR_LIST_SHORT} — dein Verwaltungs-Hub.`;

export const DISCOVER_SUBTITLE = `${PLATFORM_PILLAR_LIST} entdecken`;

export const FAVORITES_SUBTITLE = `${PLATFORM_PILLAR_LIST}, denen du folgst`;

export const PLATFORM_DESCRIPTION =
  "UNZE vereint Communities, Gruppen, Events, Services, Auszeichnungen und Zertifikate auf einer Plattform — mit Verifizierung und Monetarisierung.";

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
    description: "Angebote und Services anbieten.",
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
