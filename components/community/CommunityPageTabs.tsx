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
      className="-mx-1 overflow-x-auto px-1 pb-0.5 sm:overflow-visible"
      aria-label="Community-Bereiche"
    >
      <div className="grid min-w-[min(100%,22.5rem)] grid-cols-6 gap-1 sm:min-w-0 sm:gap-1.5">
        {COMMUNITY_TAB_IDS.map((tab) => {
          const active = tab === activeTab;
          const Icon = TAB_ICONS[tab];
          return (
            <Link
              key={tab}
              href={tab === "overview" ? `/community/${slug}` : `/community/${slug}?tab=${tab}`}
              className={cn(
                "flex min-h-[3.25rem] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 text-center transition-all active:scale-[0.98] sm:min-h-[2.75rem] sm:rounded-2xl sm:px-2 sm:py-2",
                active
                  ? "bg-unze-green text-white shadow-md ring-2 ring-unze-green/25 ring-offset-1"
                  : "bg-white text-unze-ink-secondary shadow-sm hover:bg-unze-surface-muted/60",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 sm:h-4 sm:w-4",
                  active ? "opacity-100" : "opacity-80",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "max-w-full px-0.5 text-center text-[10px] font-semibold leading-snug sm:text-xs sm:leading-tight",
                  active && "font-bold",
                )}
              >
                {COMMUNITY_TAB_LABELS[tab]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
