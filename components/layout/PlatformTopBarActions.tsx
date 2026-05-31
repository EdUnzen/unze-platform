"use client";

import dynamic from "next/dynamic";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

const NotificationCenter = dynamic(
  () =>
    import("@/components/notifications/NotificationCenter").then(
      (m) => m.NotificationCenter,
    ),
  { loading: () => null },
);

interface PlatformTopBarActionsProps {
  userId: string | null;
  unreadCount: number;
  showDashboard: boolean;
}

export function PlatformTopBarActions({
  userId,
  unreadCount,
  showDashboard,
}: PlatformTopBarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {showDashboard && (
        <Link
          href="/dashboard"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm"
          aria-label="Creator Dashboard"
          data-testid="platform-dashboard-link"
        >
          <LayoutDashboard className="h-4 w-4 text-unze-green" aria-hidden />
        </Link>
      )}
      {userId ? (
        <NotificationCenter compact notifications={[]} unreadCount={unreadCount} />
      ) : (
        <Link
          href="/auth/login"
          className="rounded-xl bg-unze-green px-3 py-1.5 text-xs font-semibold text-white"
        >
          Anmelden
        </Link>
      )}
    </div>
  );
}
