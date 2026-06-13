"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const PREFETCH_ROUTES = [
  "/discover",
  "/discover?tab=events",
  "/profile",
  "/favorites",
] as const;

/**
 * Lädt häufig genutzte Routen im Idle vor (Next.js Router Prefetch).
 */
export function RoutePrefetch() {
  const router = useRouter();

  useEffect(() => {
    const run = () => {
      for (const route of PREFETCH_ROUTES) {
        router.prefetch(route);
      }
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }

    const t = globalThis.setTimeout(run, 1500);
    return () => globalThis.clearTimeout(t);
  }, [router]);

  return null;
}
