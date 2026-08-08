import { isBusinessPath } from "@/lib/constants/business-site";
import {
  STUDIO_INTERNAL_PREFIXES,
  isLocalDevHost,
  isMarketingHost,
  isPlatformPath,
} from "@/lib/constants/site";

const COMMUNITY_PREVIEW_RE = /^\/community\/[^/]+$/;

function isStudioInternalPath(pathname: string): boolean {
  return STUDIO_INTERNAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Marketing-Routen mit eigenem Layout in app/(marketing)/ */
export function isMarketingGroupPath(pathname: string): boolean {
  return (
    pathname === "/communities" ||
    pathname.startsWith("/communities/") ||
    pathname === "/events" ||
    pathname.startsWith("/events/") ||
    pathname === "/services" ||
    pathname.startsWith("/services/") ||
    pathname === "/impressum" ||
    pathname.startsWith("/impressum/") ||
    pathname === "/datenschutz" ||
    pathname.startsWith("/datenschutz/") ||
    pathname === "/kontakt" ||
    pathname.startsWith("/kontakt/") ||
    pathname === "/agb" ||
    pathname.startsWith("/agb/")
  );
}

/**
 * Entscheidet, ob PlatformShell (BottomNav) aktiv ist.
 * Pfadbasiert — funktioniert zuverlässig bei Client-Navigation (usePathname).
 */
export function shouldWrapPlatformShellForPath(
  pathname: string,
  host: string | null | undefined,
): boolean {
  if (isBusinessPath(pathname) || isMarketingGroupPath(pathname)) {
    return false;
  }

  if (isMarketingHost(host) && pathname === "/") {
    return false;
  }

  // unze.app: Community-Detail = Marketing-Vorschau, nie Connect-BottomNav
  if (isMarketingHost(host) && COMMUNITY_PREVIEW_RE.test(pathname)) {
    return false;
  }

  if (isLocalDevHost(host) && pathname === "/") {
    return false;
  }

  if (isStudioInternalPath(pathname)) {
    return false;
  }

  if (pathname === "/" || isPlatformPath(pathname)) {
    return true;
  }

  // Connect-Host: /community/[slug] gehört zur App
  if (COMMUNITY_PREVIEW_RE.test(pathname)) {
    return true;
  }

  return false;
}
