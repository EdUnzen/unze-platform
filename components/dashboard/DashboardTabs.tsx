"use client";

import { DASHBOARD_TAB_GROUPS } from "@/lib/constants/dashboard";
import { getVisibleDashboardTabs } from "@/lib/dashboard/filter-tabs";
import { AttentionBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils/cn";
import type { CommunityRole } from "@/types/database";
import type { DashboardTabId } from "@/types/dashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

interface DashboardTabsProps {
  slug: string;
  viewerRole: CommunityRole;
  pendingApplicationCount?: number;
  pendingReportCount?: number;
}

function tabAttentionCount(
  tabId: DashboardTabId,
  pendingApplicationCount: number,
  pendingReportCount: number,
): number {
  if (tabId === "requests") return pendingApplicationCount;
  if (tabId === "moderation") return pendingReportCount;
  return 0;
}

export function DashboardTabs({
  slug,
  viewerRole,
  pendingApplicationCount = 0,
  pendingReportCount = 0,
}: DashboardTabsProps) {
  const pathname = usePathname();
  const visibleTabs = getVisibleDashboardTabs(viewerRole);

  const groups = useMemo(
    () =>
      DASHBOARD_TAB_GROUPS.map((group) => ({
        ...group,
        tabs: group.tabIds
          .map((id) => visibleTabs.find((t) => t.id === id))
          .filter(Boolean) as typeof visibleTabs,
      })).filter((g) => g.tabs.length > 0),
    [visibleTabs],
  );

  const activeTab = visibleTabs.find((tab) => {
    const href = tab.href(slug);
    return (
      pathname === href ||
      (tab.id === "overview" && pathname === `/dashboard/community/${slug}`)
    );
  });

  const activeGroupId =
    groups.find((g) => g.tabs.some((t) => t.id === activeTab?.id))?.id ??
    groups[0]?.id ??
    "general";

  const [selectedGroupId, setSelectedGroupId] = useState(activeGroupId);
  const effectiveGroupId = groups.some((g) => g.id === selectedGroupId)
    ? selectedGroupId
    : activeGroupId;

  const selectedGroup =
    groups.find((g) => g.id === effectiveGroupId) ?? groups[0];

  return (
    <nav className="mb-6 space-y-3" aria-label="Dashboard-Bereiche">
      <div
        className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none"
        role="tablist"
        aria-label="Dashboard-Kategorien"
      >
        {groups.map((group) => {
          const isActive = effectiveGroupId === group.id;
          const groupAttention = group.tabs.reduce(
            (sum, tab) =>
              sum + tabAttentionCount(tab.id, pendingApplicationCount, pendingReportCount),
            0,
          );

          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedGroupId(group.id)}
              className={cn(
                "relative shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                isActive
                  ? "bg-unze-green text-white shadow-sm"
                  : "border border-unze-border bg-white text-unze-ink-secondary",
              )}
            >
              {group.label}
              {groupAttention > 0 && !isActive && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {groupAttention > 9 ? "9+" : groupAttention}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedGroup && (
        <div className="flex flex-wrap gap-1 rounded-2xl bg-unze-surface-muted p-1">
          {selectedGroup.tabs.map((tab) => {
            const href = tab.href(slug);
            const isActive =
              pathname === href ||
              (tab.id === "overview" &&
                pathname === `/dashboard/community/${slug}`);
            const Icon = tab.icon;
            const attention = tabAttentionCount(
              tab.id,
              pendingApplicationCount,
              pendingReportCount,
            );

            return (
              <Link
                key={tab.id}
                href={href}
                data-testid={`dashboard-tab-${tab.id}`}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all",
                  isActive
                    ? "bg-white text-unze-ink shadow-sm"
                    : "text-unze-ink-muted",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {tab.label}
                {attention > 0 && <AttentionBadge count={attention} />}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
