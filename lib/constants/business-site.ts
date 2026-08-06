/**

 * UNZE Business — Navigation & Assets

 */



export const BUSINESS_VIDEO_SRC = "/business/hero-video.mp4";



/** @deprecated Nutze UNZE_COMMUNITY_HREF aus unze-ecosystem-nav */

export const UNZE_PLATFORM_HREF = "/" as const;



/**

 * Hauptnavigation — kurz, ruhig, max. ~10 Punkte.

 * KI und Produkte → BUSINESS_NAV_SECONDARY (Leistungen-Unterseiten).

 */

export const BUSINESS_NAV = [

  { label: "Start", href: "/business" },

  { label: "Analyse", href: "/business/analyse", emphasis: true },

  { label: "Leistungen", href: "/business/leistungen" },

  { label: "Business Core", href: "/business/business-core" },

  { label: "Webseiten", href: "/business/webseiten" },

  { label: "Apps", href: "/business/web-apps" },

  { label: "Branchen", href: "/business/branchenloesungen" },

  { label: "Preise", href: "/business/preise" },

  { label: "Service", href: "/business/servicepakete" },

  { label: "Kontakt", href: "/business/kontakt" },

] as const;



/** Erreichbar über Footer / direkte Links — nicht in der Hauptnav */
export const BUSINESS_NAV_SECONDARY = [
  { label: "KI", href: "/business/ki-automatisierung" },
  { label: "Produkte", href: "/business/produkte" },
] as const;

export const BUSINESS_CTA_HREF = "/business/analyse";
/** @deprecated Öffentlicher Shop entfernt — Weiterleitung auf Kontakt */
export const BUSINESS_SHOP_HREF = "/business/kontakt";



export function isBusinessPath(pathname: string): boolean {

  return pathname === "/business" || pathname.startsWith("/business/");

}


