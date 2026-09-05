"use client";

import { resolveActivityCopy } from "@/lib/activity/resolve-activity-copy";
import { groupActivityByDate } from "@/lib/activity/group-activity-by-date";
import type { ActivityFeedItem } from "@/types/events";
import {
  Award,
  CreditCard,
  Shield,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

interface UserActivityTimelineProps {
  items: ActivityFeedItem[];
  viewerUserId: string;
  emptyMessage?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DOMAIN_ICONS: Record<string, LucideIcon> = {
  community: Users,
  membership: UserPlus,
  verification: Shield,
  moderation: Shield,
  trust: Shield,
  billing: CreditCard,
  badge: Award,
  governance: Shield,
  invite: UserPlus,
};

function ActivityRow({
  item,
  viewerUserId,
}: {
  item: ActivityFeedItem;
  viewerUserId: string;
}) {
  const Icon = DOMAIN_ICONS[item.domain] ?? Users;
  const copy = resolveActivityCopy(item, viewerUserId);
  const href = copy.communitySlug ? `/community/${copy.communitySlug}` : null;

  const inner = (
    <>
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-unze-green shadow-sm ring-1 ring-unze-border/50">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-unze-ink">{copy.title}</p>
        {copy.subtitle && (
          <p className="text-xs text-unze-ink-secondary">{copy.subtitle}</p>
        )}
        <time className="mt-1 block text-[11px] text-unze-ink-muted">
          {formatTime(item.createdAt)}
        </time>
      </div>
    </>
  );

  if (href) {
    return (
      <li>
        <Link
          href={href}
          className="flex items-start gap-3 rounded-2xl border border-unze-border/60 bg-unze-surface-muted/30 px-3 py-3 transition hover:border-unze-green/30 hover:bg-unze-green-muted/15"
        >
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 rounded-2xl border border-unze-border/60 bg-unze-surface-muted/30 px-3 py-3">
      {inner}
    </li>
  );
}

export function UserActivityTimeline({
  items,
  viewerUserId,
  emptyMessage = "Noch keine Aktivität — Beitritte, Auszeichnungen und Rollen erscheinen hier.",
}: UserActivityTimelineProps) {
  const groups = groupActivityByDate(items);

  if (groups.length === 0) {
    return <p className="text-sm text-unze-ink-secondary">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-6" data-testid="user-activity-timeline">
      {groups.map((group) => (
        <section key={group.label}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-unze-ink-muted">
            {group.label}
          </h2>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <ActivityRow key={item.id} item={item} viewerUserId={viewerUserId} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
