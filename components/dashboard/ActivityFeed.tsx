import type { ActivityFeedItem } from "@/types/events";
import { resolveActivityCopy } from "@/lib/activity/resolve-activity-copy";
import {
  Award,
  CreditCard,
  Shield,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

interface ActivityFeedProps {
  items: ActivityFeedItem[];
  emptyMessage?: string;
  viewerUserId?: string | null;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `vor ${diffH} Std.`;
  const diffD = Math.floor(diffH / 24);
  return `vor ${diffD} Tag${diffD === 1 ? "" : "en"}`;
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

export function ActivityFeed({
  items,
  emptyMessage = "Noch keine Aktivitäten.",
  viewerUserId = null,
}: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-unze-ink-secondary">{emptyMessage}</p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const Icon = DOMAIN_ICONS[item.domain] ?? Users;
        const copy = resolveActivityCopy(item, viewerUserId);
        return (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-2xl border border-unze-border/60 bg-unze-surface-muted/40 px-3 py-2.5"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-unze-green shadow-sm">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-unze-ink">{copy.title}</p>
              {copy.subtitle && (
                <p className="text-xs text-unze-ink-secondary">{copy.subtitle}</p>
              )}
              <p className="text-xs text-unze-ink-muted">
                {formatRelativeTime(item.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
