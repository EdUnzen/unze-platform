import type { ActivityFeedItem } from "@/types/events";

interface ActivityFeedProps {
  items: ActivityFeedItem[];
  emptyMessage?: string;
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

const DOMAIN_LABELS: Record<string, string> = {
  community: "Community",
  membership: "Mitgliedschaft",
  verification: "Verifizierung",
  moderation: "Moderation",
  trust: "Trust",
  billing: "Billing",
  badge: "Badge",
  governance: "Governance",
  invite: "Einladung",
};

export function ActivityFeed({
  items,
  emptyMessage = "Noch keine Aktivitäten.",
}: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-unze-ink-secondary">{emptyMessage}</p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-start gap-3 rounded-2xl bg-unze-surface-muted/60 px-3 py-2.5"
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold uppercase text-unze-ink-secondary shadow-sm">
            {(DOMAIN_LABELS[item.domain] ?? item.domain).slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-unze-ink">{item.label}</p>
            <p className="text-xs text-unze-ink-secondary">
              {formatRelativeTime(item.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
