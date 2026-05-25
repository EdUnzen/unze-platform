"use client";

import { getVisibleDashboardTabs } from "@/lib/dashboard/filter-tabs";
import { AttentionBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils/cn";
import type { CommunityRole } from "@/types/database";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardTabsProps {
  slug: string;
  viewerRole: CommunityRole;
  pendingApplicationCount?: number;
  pendingReportCount?: number;
}

export function DashboardTabs({
  slug,
  viewerRole,
  pendingApplicationCount = 0,
  pendingReportCount = 0,
}: DashboardTabsProps) {
  const pathname = usePathname();
  const tabs = getVisibleDashboardTabs(viewerRole);

  return (
    <nav
      className="-mx-4 mb-6 overflow-x-auto px-4 scrollbar-none"
      aria-label="Dashboard-Bereiche"
    >
      <div className="flex min-w-min gap-1 rounded-2xl bg-unze-surface-muted p-1">
        {tabs.map((tab) => {
          const href = tab.href(slug);
          const isActive =
            pathname === href ||
            (tab.id === "overview" && pathname === `/dashboard/community/${slug}`);

          const Icon = tab.icon;

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
              {tab.id === "requests" && pendingApplicationCount > 0 && (
                <AttentionBadge count={pendingApplicationCount} />
              )}
              {tab.id === "moderation" && pendingReportCount > 0 && (
                <AttentionBadge count={pendingReportCount} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
