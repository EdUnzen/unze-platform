/** Geschützte App-Routen — Middleware & Server-Guards */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/create",
  "/notifications",
  "/verify",
  "/profile",
] as const;

const AUTH_ONLY_PREFIXES = ["/auth/login", "/auth/signup"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
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
