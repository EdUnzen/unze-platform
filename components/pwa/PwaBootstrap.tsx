"use client";

import {
  readVisitedCommunitySlugs,
  writePwaPrefetchCache,
  type PwaPrefetchPayload,
} from "@/lib/pwa/client-cache";
import { isStandalonePwa } from "@/lib/pwa/is-standalone";
import { writePwaShellCache } from "@/lib/pwa/shell-cache";
import { useEffect } from "react";

async function warmPrefetch(): Promise<void> {
  try {
    const [prefetchRes, shellRes] = await Promise.all([
      fetch("/api/pwa/prefetch", { credentials: "include", cache: "no-store" }),
      fetch("/api/pwa/shell", { credentials: "include", cache: "no-store" }),
    ]);

    if (prefetchRes.ok) {
      const data = (await prefetchRes.json()) as PwaPrefetchPayload;
      writePwaPrefetchCache(data);
    }

    if (shellRes.ok) {
      const shell = await shellRes.json();
      writePwaShellCache({
        unreadCount: shell.unreadCount ?? 0,
        showDashboard: Boolean(shell.showDashboard),
        showOwnerCenter: Boolean(shell.showOwnerCenter),
      });
    }
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

function warmRoutes(): void {
  const slugs = readVisitedCommunitySlugs();
  slugs.slice(0, 3).forEach((slug) => {
    fetch(`/community/${slug}`, { priority: "low" }).catch(() => {});
  });
  ["/discover", "/discover?tab=events", "/profile", "/favorites"].forEach(
    (path) => {
      fetch(path, { priority: "low", credentials: "include" }).catch(() => {});
    },
  );
}

interface PwaBootstrapProps {
  userId: string | null;
}

/**
 * PWA: SW + Warmcache. Installierte App startet Prefetch sofort;
 * Browser-Tab nutzt requestIdleCallback.
 */
export function PwaBootstrap({ userId }: PwaBootstrapProps) {
  useEffect(() => {
    registerServiceWorker();
    if (!userId) return;

    const run = () => {
      void warmPrefetch();
      warmRoutes();
    };

    const registerBackgroundSync = () => {
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        navigator.serviceWorker.ready
          .then((reg) => {
            const syncReg = reg as ServiceWorkerRegistration & {
              sync?: { register: (tag: string) => Promise<void> };
            };
            return syncReg.sync?.register("unze-pwa-warmup");
          })
          .catch(() => {});
      }
    };

    if (isStandalonePwa()) {
      run();
      registerBackgroundSync();
      return;
    }

    registerBackgroundSync();

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const t = globalThis.setTimeout(run, 1200);
    return () => globalThis.clearTimeout(t);
  }, [userId]);

  return null;
}
