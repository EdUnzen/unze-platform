"use client";

import {
  COMMUNITY_TAB_IDS,
  COMMUNITY_TAB_LABELS,
  type CommunityTabId,
} from "@/lib/constants/community-tabs";
import { cn } from "@/lib/utils/cn";
import {
  Calendar,
  LayoutGrid,
  Megaphone,
  Users,
  UserCircle,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export type { CommunityTabId };
export { COMMUNITY_TAB_IDS, COMMUNITY_TAB_LABELS };

const TAB_ICONS: Record<CommunityTabId, LucideIcon> = {
  overview: LayoutGrid,
  groups: Users,
  events: Calendar,
  services: Wrench,
  members: UserCircle,
  feed: Megaphone,
};

interface CommunityPageTabsProps {
  slug: string;
  activeTab: CommunityTabId;
}

export function CommunityPageTabs({ slug, activeTab }: CommunityPageTabsProps) {
  return (
    <nav
      className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1"
      aria-label="Community-Bereiche"
    >
      {COMMUNITY_TAB_IDS.map((tab) => {
        const active = tab === activeTab;
        const Icon = TAB_ICONS[tab];
        return (
          <Link
            key={tab}
            href={tab === "overview" ? `/community/${slug}` : `/community/${slug}?tab=${tab}`}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
              active
                ? "bg-unze-green text-white shadow-sm"
                : "bg-white text-unze-ink-secondary shadow-sm",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
            {COMMUNITY_TAB_LABELS[tab]}
          </Link>
        );
      })}
    </nav>
  );
}
