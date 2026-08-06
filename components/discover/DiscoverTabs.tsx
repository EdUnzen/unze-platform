"use client";

import {
  DISCOVER_TAB_IDS,
  DISCOVER_TAB_LABELS,
  type DiscoverTabId,
} from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/** Legacy-Tabs aus alten Links → Communities */
const LEGACY_TAB_MAP: Record<string, DiscoverTabId> = {
  feed: "communities",
  trends: "communities",
  new: "communities",
  creators: "communities",
};

export type { DiscoverTabId };

export function DiscoverTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") ?? "communities";
  const active: DiscoverTabId =
    LEGACY_TAB_MAP[rawTab] ??
    (DISCOVER_TAB_IDS.includes(rawTab as DiscoverTabId)
      ? (rawTab as DiscoverTabId)
      : "communities");

  return (
    <div
      className="mb-6 flex gap-1 overflow-x-auto rounded-2xl bg-unze-surface-muted p-1 scrollbar-none"
      role="tablist"
      aria-label="Discover-Bereiche"
    >
      {DISCOVER_TAB_IDS.map((tabId) => {
        const href = `${pathname}?tab=${tabId}`;
        const isActive = active === tabId;
        return (
          <Link
            key={tabId}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "shrink-0 rounded-xl px-3 py-2.5 text-center text-sm font-medium transition-all sm:flex-1",
              isActive
                ? "bg-white text-unze-ink shadow-sm"
                : "text-unze-ink-muted",
            )}
          >
            {DISCOVER_TAB_LABELS[tabId]}
          </Link>
        );
      })}
    </div>
  );
}
