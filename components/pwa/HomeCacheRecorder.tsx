"use client";

import { writePwaHomeCache } from "@/lib/pwa/client-cache";
import { useEffect } from "react";

interface HomeCacheRecorderProps {
  displayName: string | null;
  communities: Array<{ slug: string; title: string }>;
  pendingApplicationCount: number;
  upcomingEventCount: number;
}

/** Speichert Home-Snapshot lokal für schnelleren PWA-Neustart. */
export function HomeCacheRecorder({
  displayName,
  communities,
  pendingApplicationCount,
  upcomingEventCount,
}: HomeCacheRecorderProps) {
  useEffect(() => {
    writePwaHomeCache({
      displayName,
      communityTitles: communities.slice(0, 8).map((c) => ({
        slug: c.slug,
        title: c.title,
      })),
      pendingApplicationCount,
      upcomingEventCount,
    });
  }, [displayName, communities, pendingApplicationCount, upcomingEventCount]);

  return null;
}
