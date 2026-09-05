import type { ActivityFeedItem } from "@/types/events";

export type ActivityDateGroup = {
  label: string;
  items: ActivityFeedItem[];
};

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function groupActivityByDate(items: ActivityFeedItem[]): ActivityDateGroup[] {
  if (items.length === 0) return [];

  const now = new Date();
  const today = startOfDay(now);
  const yesterday = today - 86_400_000;
  const weekAgo = today - 7 * 86_400_000;

  const buckets = new Map<string, ActivityFeedItem[]>();
  const order: string[] = [];

  for (const item of items) {
    const ts = startOfDay(new Date(item.createdAt));
    let label: string;

    if (ts >= today) label = "Heute";
    else if (ts >= yesterday) label = "Gestern";
    else if (ts >= weekAgo) label = "Diese Woche";
    else {
      label = new Intl.DateTimeFormat("de-DE", {
        month: "long",
        year: "numeric",
      }).format(new Date(item.createdAt));
    }

    if (!buckets.has(label)) {
      buckets.set(label, []);
      order.push(label);
    }
    buckets.get(label)!.push(item);
  }

  return order.map((label) => ({
    label,
    items: buckets.get(label) ?? [],
  }));
}
