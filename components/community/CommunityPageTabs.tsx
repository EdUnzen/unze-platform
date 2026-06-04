"use client";

import {
  COMMUNITY_TAB_IDS,
  COMMUNITY_TAB_LABELS,
  type CommunityTabId,
} from "@/lib/constants/community-tabs";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export type { CommunityTabId };
export { COMMUNITY_TAB_IDS, COMMUNITY_TAB_LABELS };

interface CommunityPageTabsProps {
  slug: string;
  activeTab: CommunityTabId;
}

export function CommunityPageTabs({ slug, activeTab }: CommunityPageTabsProps) {
  return (
    <nav
      className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 pb-1"
      aria-label="Community-Bereiche"
    >
      {COMMUNITY_TAB_IDS.map((tab) => {
        const active = tab === activeTab;
        return (
          <Link
            key={tab}
            href={tab === "overview" ? `/community/${slug}` : `/community/${slug}?tab=${tab}`}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
              active
                ? "bg-unze-green text-white"
                : "bg-white text-unze-ink-secondary shadow-sm",
            )}
            aria-current={active ? "page" : undefined}
          >
            {COMMUNITY_TAB_LABELS[tab]}
          </Link>
        );
      })}
    </nav>
  );
}
