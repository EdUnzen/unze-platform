/** Geschützte App-Routen — Middleware & Server-Guards */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/create",
  "/notifications",
  "/verify",
  "/profile",
] as const;

/** Geschützte Profil-Unterseiten (Root /profile ist öffentlich). */
export const PROTECTED_PROFILE_PREFIXES = [
  "/profile/settings",
  "/profile/billing",
] as const;

const AUTH_ONLY_PREFIXES = ["/auth/login", "/auth/signup"] as const;

/** Profil-Root ist öffentlich (Gast-Ansicht); Unterseiten bleiben geschützt. */
const PROFILE_PUBLIC_PATHS = new Set(["/profile"]);

export function isProtectedPath(pathname: string): boolean {
  if (PROFILE_PUBLIC_PATHS.has(pathname)) return false;

  if (pathname.startsWith("/profile/")) {
    return true;
  }

  return PROTECTED_PREFIXES.some((prefix) => {
    if (prefix === "/profile") return false;
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export function isAuthPage(pathname: string): boolean {
  return AUTH_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function safeRedirectPath(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim();
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith("/auth/")) return "/";
  return value;
}

export function buildLoginUrl(returnTo: string): string {
  const next = safeRedirectPath(returnTo);
  return `/auth/login?next=${encodeURIComponent(next)}`;
}
