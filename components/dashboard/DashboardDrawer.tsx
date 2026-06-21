"use client";

import { useDashboardShell } from "@/components/dashboard/dashboard-shell-context";
import { AttentionBadge } from "@/components/dashboard/StatusBadge";
import { ROLE_LABELS } from "@/lib/constants/dashboard";
import { getVisibleDashboardDrawerSections } from "@/lib/dashboard/filter-drawer-items";
import type { ManagedCommunity } from "@/types/dashboard";
import type { CommunityRole } from "@/types/database";
import { cn } from "@/lib/utils/cn";
import { ChevronRight, ExternalLink, LayoutGrid, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface DashboardDrawerProps {
  slug?: string;
  communityTitle?: string;
  viewerRole?: CommunityRole;
  accessLabel?: string;
  managedCommunities: ManagedCommunity[];
  attentionCounts: {
    applications: number;
    reports: number;
    removals: number;
    payments: number;
  };
  monetizationEnabled?: boolean;
}

function attentionForItem(
  key: DashboardDrawerProps["attentionCounts"],
  attentionKey?: string,
): number {
  if (!attentionKey) return 0;
  if (attentionKey === "applications") return key.applications;
  if (attentionKey === "reports") return key.reports;
  if (attentionKey === "removals") return key.removals;
  if (attentionKey === "payments") return key.payments;
  return 0;
}

export function DashboardDrawer({
  slug,
  communityTitle,
  viewerRole = "moderator",
  accessLabel,
  managedCommunities,
  attentionCounts,
  monetizationEnabled = false,
}: DashboardDrawerProps) {
  const { drawerOpen, closeDrawer } = useDashboardShell();
  const pathname = usePathname();
  const sections = slug ? getVisibleDashboardDrawerSections(viewerRole) : [];

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  const openTasksTotal = slug
    ? attentionForItem(attentionCounts, "applications") +
      attentionForItem(attentionCounts, "reports") +
      attentionForItem(attentionCounts, "removals") +
      (monetizationEnabled && viewerRole === "creator"
        ? attentionCounts.payments
        : 0)
    : managedCommunities.reduce(
        (sum, c) => sum + (c.pendingApplicationCount ?? 0),
        0,
      );

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Creator-Dashboard">
      <button
        type="button"
        className="absolute inset-0 bg-unze-ink/45 backdrop-blur-[2px] animate-fade-in"
        onClick={closeDrawer}
        aria-label="Men\u00fc schlie\u00dfen"
      />

      <aside
        className={cn(
          "relative flex h-full w-[min(88vw,320px)] flex-col bg-white shadow-2xl animate-slide-left",
          "pt-[max(0.75rem,env(safe-area-inset-top))]",
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="flex items-start justify-between gap-2 border-b border-unze-border/70 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-unze-green-dark">
              Creator-Dashboard
            </p>
            {slug && communityTitle ? (
              <>
                <h2 className="truncate text-base font-bold text-unze-ink">{communityTitle}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-unze-green-muted px-2 py-0.5 text-[10px] font-semibold text-unze-green-dark">
                    {ROLE_LABELS[viewerRole]}
                  </span>
                  {accessLabel && (
                    <span className="rounded-full bg-unze-surface-muted px-2 py-0.5 text-[10px] font-medium text-unze-ink-secondary">
                      {accessLabel}
                    </span>
                  )}
                  {openTasksTotal > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {openTasksTotal} offen
                    </span>
                  )}
                </div>
              </>
            ) : (
              <h2 className="text-base font-bold text-unze-ink">Deine Communities</h2>
            )}
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-unze-surface-muted text-unze-ink-secondary"
            aria-label="Schlie\u00dfen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-none">
          {!slug ? (
            <ul className="space-y-1">
              {managedCommunities.map((community) => {
                const pending = community.pendingApplicationCount ?? 0;
                return (
                  <li key={community.id}>
                    <Link
                      href={`/dashboard/community/${community.slug}`}
                      onClick={closeDrawer}
                      className="flex min-h-[52px] items-center gap-3 rounded-2xl px-3 py-2.5 transition active:bg-unze-surface-muted"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-unze-green-muted text-unze-green">
                        <LayoutGrid className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-unze-ink">
                          {community.title}
                        </span>
                        <span className="text-xs text-unze-ink-muted">
                          {ROLE_LABELS[community.viewerRole]}
                        </span>
                      </span>
                      {pending > 0 && <AttentionBadge count={pending} />}
                      <ChevronRight className="h-4 w-4 text-unze-ink-muted" aria-hidden />
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2">
                <Link
                  href="/dashboard/crowd-partner"
                  onClick={closeDrawer}
                  className="flex min-h-[48px] items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-unze-green"
                >
                  Crowd Partner
                </Link>
              </li>
            </ul>
          ) : (
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id}>
                  <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wide text-unze-ink-muted">
                    {section.label}
                  </p>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const href = item.href(slug);
                      const isActive =
                        pathname === href ||
                        (item.id === "overview" &&
                          pathname === `/dashboard/community/${slug}`);
                      const Icon = item.icon;
                      const badge = attentionForItem(attentionCounts, item.attentionKey);
                      const hidePaymentBadge =
                        item.attentionKey === "payments" &&
                        (!monetizationEnabled || viewerRole !== "creator");

                      return (
                        <li key={item.id}>
                          <Link
                            href={href}
                            onClick={closeDrawer}
                            data-testid={`dashboard-drawer-${item.id}`}
                            className={cn(
                              "flex min-h-[48px] items-center gap-3 rounded-2xl px-3 py-2.5 transition active:scale-[0.98]",
                              isActive
                                ? "bg-unze-green text-white shadow-sm"
                                : "text-unze-ink hover:bg-unze-surface-muted",
                            )}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <span
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                isActive ? "bg-white/20" : "bg-unze-green-muted",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-4 w-4",
                                  isActive ? "text-white" : "text-unze-green",
                                )}
                                aria-hidden
                              />
                            </span>
                            <span className="flex-1 text-sm font-semibold">{item.label}</span>
                            {badge > 0 && !hidePaymentBadge && (
                              <AttentionBadge count={badge} />
                            )}
                            <ChevronRight
                              className={cn(
                                "h-4 w-4",
                                isActive ? "text-white/70" : "text-unze-ink-muted",
                              )}
                              aria-hidden
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <div className="border-t border-unze-border/70 pt-3">
                <Link
                  href="/dashboard"
                  onClick={closeDrawer}
                  className="flex min-h-[44px] items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-unze-ink-secondary"
                >
                  {"\u2190"} Alle Communities
                </Link>
                <Link
                  href={`/community/${slug}`}
                  onClick={closeDrawer}
                  className="mt-1 flex min-h-[44px] items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-unze-green"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  {"\u00d6ffentliche Ansicht"}
                </Link>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </div>
  );
}
