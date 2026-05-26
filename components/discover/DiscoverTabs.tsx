"use client";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { id: "communities", label: "Communities" },
  { id: "groups", label: "Gruppen" },
  { id: "feed", label: "Feed" },
  { id: "trends", label: "Trends" },
  { id: "new", label: "Neu" },
  { id: "creators", label: "Creator" },
] as const;

export type DiscoverTabId = (typeof TABS)[number]["id"];

export function DiscoverTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = (searchParams.get("tab") as DiscoverTabId) || "communities";

  return (
    <div
      className="mb-6 flex gap-1 overflow-x-auto rounded-2xl bg-unze-surface-muted p-1 scrollbar-none"
      role="tablist"
      aria-label="Discover-Bereiche"
    >
      {TABS.map((tab) => {
        const href = `${pathname}?tab=${tab.id}`;
        const isActive = active === tab.id;
        return (
          <Link
            key={tab.id}
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
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
