"use client";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { id: "communities", label: "Communities" },
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
      className="mb-6 flex gap-1 rounded-2xl bg-unze-surface-muted p-1"
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
              "flex-1 rounded-xl py-2.5 text-center text-sm font-medium transition-all",
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
