/**
 * Zwei getrennte Bereiche:
 *   www.unze.app         - Landingpage (read-only, Marketing)
 *   www.unzeconnect.app  - Plattform (volle Logik, Schreibzugriff)
 *
 * Gleiche Supabase-Produktions-DB; Landing liest nur oeffentliche Felder.
 */

export const MARKETING_DOMAIN = "www.unze.app";
export const MARKETING_DOMAIN_ALT = "unze.app";
export const PLATFORM_DOMAIN = "www.unzeconnect.app";
export const PLATFORM_DOMAIN_ALT = "unzeconnect.app";

export const MARKETING_BASE_URL = "https://www.unze.app";
export const PLATFORM_BASE_URL = "https://www.unzeconnect.app";

/** Vercel-Deployment-Alias - Plattform, nicht im Marketing sichtbar */
export const VERCEL_PLATFORM_ALIAS = "unze-platform.vercel.app";

export type SiteMode = "marketing" | "platform";

export const SITE_HEADER = "x-unze-site";
export const PATHNAME_HEADER = "x-unze-pathname";

const LEGAL_PREFIXES = ["/impressum", "/datenschutz", "/kontakt", "/business", "/agb"];

/** Interne Bereiche ohne Marketing-Navigation */
export const STUDIO_INTERNAL_PREFIXES = ["/admin", "/studio/app"] as const;

/** Oeffentliche Marketing-Routen (www.unze.app) */
export const MARKETING_PUBLIC_ROUTES = [
  "/",
  "/communities",
  "/events",
  "/services",
] as const;

/**
 * Nur diese Pfade leiten von der Plattform-Domain auf Marketing um.
 * "/" ist bewusst NICHT enthalten: Connect-Home bleibt auf unzeconnect.app.
 */
export const MARKETING_CROSS_DOMAIN_ROUTES = [
  "/communities",
  "/events",
  "/services",
] as const;

/** Connect-App Startseite (niemals Marketing-Landing) */
export const CONNECT_HOME_PATH = "/";

export function getConnectHomePath(): string {
  return CONNECT_HOME_PATH;
}

const PLATFORM_PREFIXES = [
  "/dashboard",
  "/discover",
  "/profile",
  "/auth",
  "/create",
  "/notifications",
  "/owner",
  "/verify",
  "/invite",
  "/creator",
  "/favorites",
  "/post",
];

/** Nur oeffentliche Community-Vorschau: /community/{slug} ohne Unterpfade */
const COMMUNITY_PREVIEW_RE = /^\/community\/[^/]+$/;

export function normalizeHost(host: string | null | undefined): string {
  return (host ?? "").split(":")[0]?.toLowerCase() ?? "";
}

export function isMarketingHost(host: string | null | undefined): boolean {
  const h = normalizeHost(host);
  return h === MARKETING_DOMAIN || h === MARKETING_DOMAIN_ALT;
}

export function isLocalDevHost(host: string | null | undefined): boolean {
  const h = normalizeHost(host);
  return h === "localhost" || h === "127.0.0.1";
}

export function isPlatformHost(host: string | null | undefined): boolean {
  const h = normalizeHost(host);
  return (
    h === PLATFORM_DOMAIN ||
    h === PLATFORM_DOMAIN_ALT ||
    h === VERCEL_PLATFORM_ALIAS ||
    h === "localhost" ||
    h === "127.0.0.1"
  );
}

export function isPlatformPath(pathname: string): boolean {
  if (PLATFORM_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (/^\/community\/[^/]+\/(group|event|edit)/.test(pathname)) {
    return true;
  }
  return false;
}

export function isMarketingPath(pathname: string): boolean {
  if (MARKETING_PUBLIC_ROUTES.includes(pathname as (typeof MARKETING_PUBLIC_ROUTES)[number])) {
    return true;
  }
  if (LEGAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (STUDIO_INTERNAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (COMMUNITY_PREVIEW_RE.test(pathname)) return true;
  return false;
}

/**
 * Marketing-/Business-Shell statt App-Shell (BottomNav).
 * Auf localhost ist siteMode oft "platform" — Pfade wie /business dürfen trotzdem
 * nie die App-Navigation bekommen.
 */
export function shouldUseMarketingShell(pathname: string, siteMode: SiteMode): boolean {
  if (siteMode === "marketing") return true;
  if (pathname === "/") return false;
  return isMarketingPath(pathname) && !isPlatformPath(pathname);
}

export function resolveSiteMode(
  host: string | null | undefined,
  pathname: string,
): SiteMode {
  if (isMarketingHost(host)) {
    return "marketing";
  }
  if (isPlatformHost(host)) {
    return "platform";
  }
  return isMarketingPath(pathname) && !isPlatformPath(pathname) ? "marketing" : "platform";
}

/** Interne Weiterleitungen auf demselben Host */
export function getInternalRedirect(
  pathname: string,
  search: string,
): string | null {
  if (pathname === "/verzeichnis") {
    return `/communities${search}`;
  }
  if (pathname === "/studio") {
    return `/business${search}`;
  }
  return null;
}

/** Cross-Domain-Weiterleitung (308) wenn Host und Pfad nicht zusammenpassen */
export function getCrossDomainRedirect(
  host: string | null | undefined,
  pathname: string,
  search: string,
): string | null {
  // Lokal: eine Next-Instanz bedient Marketing + Studio — keine Weiterleitung auf unze.app
  if (isLocalDevHost(host)) {
    return null;
  }

  const pathWithSearch = `${pathname}${search}`;

  if (isMarketingHost(host)) {
    if (isPlatformPath(pathname)) {
      return `${PLATFORM_BASE_URL}${pathWithSearch}`;
    }
    if (pathname.startsWith("/auth")) {
      return `${PLATFORM_BASE_URL}${pathWithSearch}`;
    }
    return null;
  }

  if (isPlatformHost(host) && !isMarketingHost(host)) {
    if (LEGAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return `${MARKETING_BASE_URL}${pathWithSearch}`;
    }
    if (STUDIO_INTERNAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return `${MARKETING_BASE_URL}${pathWithSearch}`;
    }
    if (
      MARKETING_CROSS_DOMAIN_ROUTES.includes(
        pathname as (typeof MARKETING_CROSS_DOMAIN_ROUTES)[number],
      )
    ) {
      return `${MARKETING_BASE_URL}${pathWithSearch}`;
    }
  }

  return null;
}

export function getMarketingBaseUrl(): string {
  return process.env.NEXT_PUBLIC_MARKETING_URL?.replace(/\/$/, "") ?? MARKETING_BASE_URL;
}

export function getPlatformBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? PLATFORM_BASE_URL;
}

export function getAppBaseUrl(): string {
  return getPlatformBaseUrl();
}

export function getPublicOrigin(): string {
  return getPlatformBaseUrl();
}

export function platformUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getPlatformBaseUrl()}${p}`;
}

export function marketingUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getMarketingBaseUrl()}${p}`;
}

export function getAppEntryPath(host?: string | null): string {
  if (isLocalDevHost(host)) {
    return "/discover";
  }
  return platformUrl("/discover");
}

export function getLoginUrl(returnTo?: string): string {
  const base = platformUrl("/auth/login");
  if (!returnTo) return base;
  return `${base}?next=${encodeURIComponent(returnTo)}`;
}

export function getRegisterUrl(): string {
  return platformUrl("/auth/login?mode=signup");
}

export function getCommunityJoinUrl(slug: string): string {
  return platformUrl(`/community/${slug}`);
}
