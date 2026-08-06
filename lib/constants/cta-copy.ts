/**
 * Einheitliche CTA- und Hero-Texte — App, Landing, Marketing.
 * Alle Strings als echtes UTF-8 (keine \\uXXXX-Escapes, keine JSX-Textknoten mit Sonderzeichen).
 */

export const CTA_SIGN_IN = "Anmelden";
export const CTA_REGISTER_FREE = "Kostenlos registrieren";
export const CTA_PLATFORM_DISCOVER = "Plattform entdecken";
export const CTA_PLATFORM_DISCOVER_LINK = "Plattform entdecken →";
export const CTA_COMMUNITIES_DISCOVER = "Communities entdecken";
export const CTA_APP_USE = "App nutzen";
export const CTA_CREATOR = "Creator werden";
export const CTA_PROJECT_INQUIRY = "Projekt anfragen";

export const HERO_GUEST_COPY = {
  eyebrow: "Willkommen bei UNZE",
  headline: "Deine Plattform für Communities, Gruppen, Events und Services",
  primary: CTA_REGISTER_FREE,
  secondary: CTA_SIGN_IN,
  tertiaryLink: CTA_PLATFORM_DISCOVER_LINK,
} as const;

export const HERO_MEMBER_COPY = {
  eyebrow: "Mein UNZE",
  headline: "Verwalten, entdecken und wachsen — an einem Ort",
  primary: CTA_PLATFORM_DISCOVER,
} as const;

export const HOME_VALUE_SECTION_COPY = {
  title: "Was UNZE bietet",
  subtitle: "Von der Community bis zum Zertifikat — alles auf einer Plattform.",
} as const;

export const HOME_GUEST_FOOTER_COPY = {
  title: "Von der Startseite in die App",
  body:
    "Registriere dich oder melde dich an — dann verwaltest du Communities unter Entdecken, baust dein Netzwerk auf, sammelst Auszeichnungen und installierst UNZE als App.",
  primary: CTA_REGISTER_FREE,
  secondary: CTA_PLATFORM_DISCOVER,
} as const;
