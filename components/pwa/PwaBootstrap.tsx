"use client";

import {
  readVisitedCommunitySlugs,
  writePwaPrefetchCache,
  type PwaPrefetchPayload,
} from "@/lib/pwa/client-cache";
import { useEffect } from "react";

async function warmPrefetch(userId: string | null): Promise<void> {
  if (!userId) return;
  try {
    const res = await fetch("/api/pwa/prefetch", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = (await res.json()) as PwaPrefetchPayload;
    writePwaPrefetchCache(data);
  } catch {
    /* offline */
  }
}

function registerServiceWorker(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => {
      void reg.update();
    })
    .catch(() => {
      /* unsupported or blocked */
    });
}

interface PwaBootstrapProps {
  userId: string | null;
}

/**
 * Installierte PWA: SW registrieren + Warmcache im Idle.
 * Normale Browser-Tab-Nutzung: nur SW-Registrierung (leicht).
 */
export function PwaBootstrap({ userId }: PwaBootstrapProps) {
  useEffect(() => {
    registerServiceWorker();

    if (!userId) return;

    const run = () => {
      void warmPrefetch(userId);
      const slugs = readVisitedCommunitySlugs();
      slugs.slice(0, 3).forEach((slug) => {
        fetch(`/community/${slug}`, { priority: "low" }).catch(() => {});
      });
      ["/discover", "/discover?tab=events", "/profile", "/favorites"].forEach(
        (path) => {
          fetch(path, { priority: "low", credentials: "include" }).catch(() => {});
        },
      );
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }

    const t = globalThis.setTimeout(run, 2500);
    return () => globalThis.clearTimeout(t);
  }, [userId]);

  return null;
}
