"use client";

import { isTrackableAnalyticsPath } from "@/lib/studio/site-analytics-paths";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const VISITOR_KEY = "unze_vid";

function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing && existing.length <= 64) return existing;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return `v-${Date.now()}`;
  }
}

export function PageViewBeacon() {
  const pathname = usePathname() ?? "";
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !isTrackableAnalyticsPath(pathname)) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const payload = {
      path: pathname,
      visitorId: getOrCreateVisitorId(),
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    };

    void fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* stillfesch — Statistik darf UX nicht stören */
    });
  }, [pathname]);

  return null;
}
