"use client";

import { markReadAction } from "@/app/notifications/actions";
import {
  getNotificationActionLabel,
  resolveNotificationHref,
} from "@/lib/notifications/resolve-link";
import type { NotificationItem } from "@/types/governance";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  application: "Bewerbung",
  moderation: "Moderation",
  invite: "Einladung",
  community_event: "Community",
  system: "System",
};

interface NotificationCenterProps {
  notifications: NotificationItem[];
  unreadCount: number;
  compact?: boolean;
}

export function NotificationCenter({
  notifications,
  unreadCount,
  compact = false,
}: NotificationCenterProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(async () => {
      await markReadAction(id);
      router.refresh();
    });
  }

  function handleOpen(notification: NotificationItem) {
    if (!notification.readAt) markRead(notification.id);
    const href = resolveNotificationHref(notification);
    if (href) router.push(href);
  }

  if (compact) {
    return (
      <Link
        href="/notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm"
        aria-label={`Benachrichtigungen${unreadCount ? `, ${unreadCount} ungelesen` : ""}`}
        data-testid="notification-bell"
      >
        <Bell className="h-4 w-4 text-unze-ink" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="space-y-4" data-testid="notification-center">
      <p className="rounded-xl bg-unze-green-muted/40 px-3 py-2 text-xs text-unze-green-dark">
        Beim Öffnen dieser Seite werden alle Einträge als gelesen markiert — der rote
        Hinweis verschwindet automatisch.
      </p>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-unze-border bg-white p-8 text-center">
          <Bell className="mx-auto mb-2 h-8 w-8 text-unze-ink-muted" aria-hidden />
          <p className="text-sm font-medium text-unze-ink">Keine Benachrichtigungen</p>
          <p className="mt-1 text-xs text-unze-ink-muted">
            Bewerbungen, Moderation und Community-Events erscheinen hier.
          </p>
          <Link
            href="/discover"
            className="mt-4 inline-block text-sm font-medium text-unze-green"
          >
            Communities entdecken
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const href = resolveNotificationHref(n);
            const actionLabel = getNotificationActionLabel(n);
            const inner = (
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="mb-1 inline-block rounded-full bg-unze-surface-muted px-2 py-0.5 text-[10px] font-semibold text-unze-ink-muted">
                    {CATEGORY_LABELS[n.category] ?? n.category}
                  </span>
                  <p className="text-sm font-semibold text-unze-ink">{n.title}</p>
                  {n.body && (
                    <p className="mt-0.5 text-xs text-unze-ink-secondary">{n.body}</p>
                  )}
                  {href && actionLabel && (
                    <span className="mt-2 inline-flex items-center gap-0.5 text-xs font-medium text-unze-green">
                      {actionLabel}
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  )}
                </div>
                <time className="shrink-0 text-[10px] text-unze-ink-muted">
                  {new Date(n.createdAt).toLocaleDateString("de-DE")}
                </time>
              </div>
            );

            return (
              <li key={n.id} data-testid={`notification-${n.id}`}>
                {href ? (
                  <button
                    type="button"
                    onClick={() => handleOpen(n)}
                    className={`w-full rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
                      n.readAt
                        ? "border-unze-border/50 bg-white opacity-80"
                        : "border-unze-green/30 bg-unze-green-muted/20"
                    }`}
                  >
                    {inner}
                  </button>
                ) : (
                  <div
                    className={`rounded-2xl border p-4 ${
                      n.readAt
                        ? "border-unze-border/50 bg-white opacity-80"
                        : "border-unze-green/30 bg-unze-green-muted/20"
                    }`}
                  >
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
