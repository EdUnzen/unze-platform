"use client";

import { useDashboardShell } from "@/components/dashboard/dashboard-shell-context";
import { cn } from "@/lib/utils/cn";
import { Menu } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  openTaskCount?: number;
  className?: string;
}

export function DashboardHeader({
  title,
  subtitle,
  openTaskCount = 0,
  className,
}: DashboardHeaderProps) {
  const { openDrawer } = useDashboardShell();

  return (
    <header className={cn("mb-4", className)}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={openDrawer}
          data-testid="dashboard-drawer-trigger"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-unze-border bg-white shadow-sm transition active:scale-[0.98]"
          aria-label="Dashboard-Menü öffnen"
        >
          <Menu className="h-5 w-5 text-unze-green" aria-hidden />
          {openTaskCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {openTaskCount > 9 ? "9+" : openTaskCount}
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="truncate text-xl font-bold tracking-tight text-unze-ink">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-unze-ink-secondary">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
