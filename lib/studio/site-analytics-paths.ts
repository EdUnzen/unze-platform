/** Nur UNZE-Business-Landing — kein Connect, kein Studio, keine App. */
const TRACKABLE_PREFIXES = ["/business"] as const;

/** Client-sicher — keine Server-/DB-Imports. */
export function isTrackableAnalyticsPath(pathname: string): boolean {
  if (!pathname || pathname.startsWith("/studio") || pathname.startsWith("/admin")) {
    return false;
  }
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return false;
  }
  return TRACKABLE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
