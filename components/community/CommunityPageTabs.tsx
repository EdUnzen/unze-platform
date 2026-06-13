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
    <nav aria-label="Community-Bereiche">
      {/* Mobile: 3×2 — größere Touch-Flächen, keine gequetschten Labels */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        {COMMUNITY_TAB_IDS.map((tab) => {
          const active = tab === activeTab;
          const Icon = TAB_ICONS[tab];
          return (
            <Link
              key={tab}
              href={
                tab === "overview" ? `/community/${slug}` : `/community/${slug}?tab=${tab}`
              }
              className={cn(
                "flex min-h-[3.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-center transition-all active:scale-[0.98]",
                active
                  ? "bg-unze-green text-white shadow-md ring-2 ring-unze-green/30 ring-offset-2"
                  : "bg-white text-unze-ink-secondary shadow-sm",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className={cn("text-xs font-semibold leading-tight", active && "font-bold")}>
                {COMMUNITY_TAB_LABELS[tab]}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Desktop / Tablet: eine Zeile */}
      <div className="hidden grid-cols-6 gap-1.5 sm:grid">
        {COMMUNITY_TAB_IDS.map((tab) => {
          const active = tab === activeTab;
          const Icon = TAB_ICONS[tab];
          return (
            <Link
              key={tab}
              href={
                tab === "overview" ? `/community/${slug}` : `/community/${slug}?tab=${tab}`
              }
              className={cn(
                "flex min-h-[2.75rem] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition-all active:scale-[0.98]",
                active
                  ? "bg-unze-green text-white shadow-md ring-2 ring-unze-green/25 ring-offset-1"
                  : "bg-white text-unze-ink-secondary shadow-sm hover:bg-unze-surface-muted/60",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className={cn("text-xs font-semibold", active && "font-bold")}>
                {COMMUNITY_TAB_LABELS[tab]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
