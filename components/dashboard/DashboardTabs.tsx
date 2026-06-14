"use client";

import { DASHBOARD_TAB_GROUPS } from "@/lib/constants/dashboard";
import { getVisibleDashboardTabs } from "@/lib/dashboard/filter-tabs";
import { AttentionBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils/cn";
import type { CommunityRole } from "@/types/database";
import type { DashboardTabId } from "@/types/dashboard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface DashboardTabsProps {
  slug: string;
  viewerRole: CommunityRole;
  pendingApplicationCount?: number;
  pendingReportCount?: number;
}

const GROUP_HINTS: Record<string, string> = {
  general: "Übersicht & Kennzahlen",
  members: "Mitglieder, Anträge, Zugang, Rollen",
  content: "Gruppen, Events, Badges",
  safety: "Moderation, Audit, Verifizierung",
  business: "Preise & Abonnements",
  system: "Community-Einstellungen",
};

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
    null;

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(
    activeGroupId,
  );

  useEffect(() => {
    if (activeGroupId) setExpandedGroupId(activeGroupId);
  }, [activeGroupId]);

  const expandedGroup = groups.find((g) => g.id === expandedGroupId);

  function handleGroupClick(groupId: string, tabCount: number) {
    if (tabCount === 1) {
      setExpandedGroupId(groupId);
      return;
    }
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
  }

  return (
    <nav className="mb-6 space-y-4" aria-label="Dashboard-Bereiche">
      {/* Hauptnavigation — 6 Kategorien */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-unze-ink-muted">
          Bereich wählen
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {groups.map((group) => {
            const isExpanded = expandedGroupId === group.id;
            const isActiveGroup = activeGroupId === group.id;
            const groupAttention = group.tabs.reduce(
              (sum, tab) =>
                sum +
                tabAttentionCount(
                  tab.id,
                  pendingApplicationCount,
                  pendingReportCount,
                ),
              0,
            );
            const singleTab = group.tabs.length === 1 ? group.tabs[0] : null;

            if (singleTab) {
              const href = singleTab.href(slug);
              const isActive = pathname === href;
              return (
                <Link
                  key={group.id}
                  href={href}
                  data-testid={`dashboard-group-${group.id}`}
                  className={cn(
                    "relative flex min-h-[72px] flex-col justify-between rounded-2xl border-2 p-3.5 transition-all active:scale-[0.98]",
                    isActive
                      ? "border-unze-green bg-unze-green text-white shadow-md"
                      : "border-unze-border bg-white text-unze-ink shadow-sm hover:border-unze-green/40 hover:bg-unze-green-muted/20",
                  )}
                >
                  <span className="text-sm font-bold leading-tight">{group.label}</span>
                  <span
                    className={cn(
                      "text-[11px] leading-snug",
                      isActive ? "text-white/80" : "text-unze-ink-muted",
                    )}
                  >
                    {GROUP_HINTS[group.id] ?? singleTab.label}
                  </span>
                </Link>
              );
            }

            return (
              <button
                key={group.id}
                type="button"
                data-testid={`dashboard-group-${group.id}`}
                onClick={() =>
                  handleGroupClick(group.id, group.tabs.length)
                }
                className={cn(
                  "relative flex min-h-[72px] flex-col justify-between rounded-2xl border-2 p-3.5 text-left transition-all active:scale-[0.98]",
                  isExpanded || isActiveGroup
                    ? "border-unze-green bg-unze-green-muted/40 text-unze-ink shadow-sm"
                    : "border-unze-border bg-white text-unze-ink shadow-sm hover:border-unze-green/40 hover:bg-unze-green-muted/20",
                )}
              >
                <span className="text-sm font-bold leading-tight">{group.label}</span>
                <span className="text-[11px] leading-snug text-unze-ink-muted">
                  {GROUP_HINTS[group.id] ?? `${group.tabs.length} Bereiche`}
                </span>
                {groupAttention > 0 && (
                  <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {groupAttention > 9 ? "9+" : groupAttention}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unterseiten — nur nach Kategorie-Auswahl */}
      {expandedGroup && expandedGroup.tabs.length > 1 && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-unze-ink-muted">
            {expandedGroup.label} — Unterseiten
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {expandedGroup.tabs.map((tab) => {
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
                    "flex min-h-[56px] items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all active:scale-[0.98]",
                    isActive
                      ? "border-unze-green bg-unze-green text-white shadow-md"
                      : "border-unze-border bg-white text-unze-ink shadow-sm hover:border-unze-green/40 hover:bg-unze-green-muted/25",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      isActive ? "bg-white/20" : "bg-unze-green-muted",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-white" : "text-unze-green",
                      )}
                      aria-hidden
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{tab.label}</span>
                  </span>
                  {attention > 0 && <AttentionBadge count={attention} />}
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-white/70" : "text-unze-ink-muted",
                    )}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
