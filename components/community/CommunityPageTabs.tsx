"use client";

import {
  COMMUNITY_TAB_IDS,
  COMMUNITY_TAB_LABELS,
  type CommunityTabId,
} from "@/lib/constants/community-tabs";
import { cn } from "@/lib/utils/cn";
import {
  Calendar,
  Home,
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
  overview: Home,
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
      className="grid grid-cols-3 gap-1 sm:grid-cols-6 sm:gap-1.5"
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
              "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-center transition-colors sm:flex-row sm:gap-1.5 sm:rounded-full sm:px-2.5",
              active
                ? "bg-unze-green text-white shadow-sm"
                : "bg-white text-unze-ink-secondary shadow-sm",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
            <span className="truncate text-[10px] font-semibold leading-tight sm:text-xs">
              {COMMUNITY_TAB_LABELS[tab]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
