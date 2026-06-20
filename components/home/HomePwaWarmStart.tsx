"use client";

import { readPwaHomeCache } from "@/lib/pwa/client-cache";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Zeigt gecachte Home-Daten sofort (PWA localStorage), waehrend der Server streamt.
 */
export function HomePwaWarmStart() {
  const [snapshot, setSnapshot] = useState(() =>
    typeof window !== "undefined" ? readPwaHomeCache() : null,
  );

  useEffect(() => {
    setSnapshot(readPwaHomeCache());
  }, []);

  if (!snapshot || snapshot.communityTitles.length === 0) return null;

  return (
    <section
      className="mb-4 rounded-2xl border border-unze-green/25 bg-unze-green-muted/30 p-3"
      aria-label="Zuletzt auf UNZE"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-unze-green-dark">
        Schnell wieder da
      </p>
      {snapshot.displayName && (
        <p className="mt-0.5 text-sm font-semibold text-unze-ink">
          Hallo, {snapshot.displayName}
        </p>
      )}
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {snapshot.communityTitles.slice(0, 4).map((c) => (
          <li key={c.slug}>
            <Link
              href={`/community/${c.slug}`}
              className="inline-block rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-unze-ink shadow-sm"
            >
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
      {(snapshot.pendingApplicationCount > 0 || snapshot.upcomingEventCount > 0) && (
        <p className="mt-2 text-[11px] text-unze-ink-secondary">
          {snapshot.pendingApplicationCount > 0 &&
            `${snapshot.pendingApplicationCount} offene Antr\u00e4ge`}
          {snapshot.pendingApplicationCount > 0 && snapshot.upcomingEventCount > 0 && " \u00b7 "}
          {snapshot.upcomingEventCount > 0 &&
            `${snapshot.upcomingEventCount} kommende Events`}
        </p>
      )}
    </section>
  );
}
