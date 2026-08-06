import { isPlatformPath, platformUrl } from "@/lib/constants/site";

/** Plattform-Pfade werden auf www.unzeconnect.app aufgeloest */
export function resolveMarketingHref(href: string): {
  href: string;
  external: boolean;
} {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return { href, external: true };
  }
  if (href.startsWith("/auth") || isPlatformPath(href)) {
    return { href: platformUrl(href), external: true };
  }
  return { href, external: false };
}
