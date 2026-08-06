/**
 * UNZE Ökosystem — Bereichswechsel Community ↔ Business
 *
 * Standard: PROJEKTE/UNZE/NAVIGATION_ECOSYSTEM.md (CORSA)
 */

import {
  isLocalDevHost,
  isMarketingHost,
  isPlatformHost,
  marketingUrl,
  normalizeHost,
} from "@/lib/constants/site";

/** Dachmarke — Plattform-Startseite (Community-Einstieg auf unze.app) */
export const UNZE_BRAND_HREF = "/" as const;

/**
 * Ziel für „← Zur Community“ aus dem Business-Bereich (Marketing, nicht App).
 * Auf unze.app identisch mit der Landing-Startseite.
 */
export const UNZE_COMMUNITY_HREF = UNZE_BRAND_HREF;

/**
 * Korrektes Ziel für „Zur Community“ — hostabhängig.
 * - unze.app → Landing `/`
 * - localhost → Marketing `/communities` (da `/` hier die Connect-App ist)
 * - Plattform-Host → absolute URL zur Marketing-Landing
 */
export function getUnzeCommunityExitHref(host: string | null | undefined): string {
  const h = normalizeHost(host);

  if (isLocalDevHost(h)) {
    return UNZE_BRAND_HREF;
  }

  if (isMarketingHost(h)) {
    return UNZE_BRAND_HREF;
  }

  if (isPlatformHost(h)) {
    return marketingUrl("/");
  }

  return UNZE_BRAND_HREF;
}

/** Business-Bereich */
export const UNZE_BUSINESS_HREF = "/business" as const;

export type UnzeEcosystemArea = "community" | "business";

export const UNZE_ECOSYSTEM_AREAS = {
  community: {
    id: "community" as const,
    label: "Community",
    href: UNZE_COMMUNITY_HREF,
    backLabel: "Zur Community",
  },
  business: {
    id: "business" as const,
    label: "Business",
    href: UNZE_BUSINESS_HREF,
    backLabel: "Zur Community",
  },
} as const;

export function resolveUnzeEcosystemArea(pathname: string): UnzeEcosystemArea {
  return pathname === UNZE_BUSINESS_HREF || pathname.startsWith(`${UNZE_BUSINESS_HREF}/`)
    ? "business"
    : "community";
}
