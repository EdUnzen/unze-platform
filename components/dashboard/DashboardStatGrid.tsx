import type { CommunityDashboardStats } from "@/types/dashboard";
import { cn } from "@/lib/utils/cn";
import { Award, Eye, FileText, Heart, Share2, Users, FolderOpen } from "lucide-react";
import { formatMemberCount } from "@/lib/utils/format-metrics";
import { formatCompactCount } from "@/lib/utils/format-metrics";
import Link from "next/link";

interface DashboardStatGridProps {
  stats: CommunityDashboardStats;
  slug?: string;
}

export function DashboardStatGrid({ stats, slug }: DashboardStatGridProps) {
  const items = [
    {
      label: "Mitglieder",
      value: formatMemberCount(stats.memberCount),
      icon: Users,
      href: slug ? `/dashboard/community/${slug}/members` : undefined,
      highlight: true,
    },
    {
      label: "Aufrufe/Woche",
      value: stats.weeklyViews ? formatCompactCount(stats.weeklyViews) : "—",
      icon: Eye,
      highlight: (stats.weeklyViews ?? 0) > 0,
    },
    {
      label: "Shares",
      value: stats.shareCount ? formatCompactCount(stats.shareCount) : "—",
      icon: Share2,
      highlight: (stats.shareCount ?? 0) > 0,
    },
    {
      label: "Beiträge",
      value: String(stats.postCount),
      icon: FileText,
      highlight: stats.postCount > 0,
    },
    {
      label: "Follower",
      value: formatMemberCount(stats.followerCount),
      icon: Heart,
    },
    { label: "Gruppen", value: String(stats.groupCount), icon: FolderOpen },
    { label: "Badges", value: String(stats.badgeCount), icon: Award },
  ];

  return (
    <section>
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-unze-ink">KPI-Übersicht</h2>
        <p className="text-xs text-unze-ink-secondary">
          Engagement, Reichweite und Community-Wachstum
        </p>
      </header>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map(({ label, value, icon: Icon, href, highlight }) => {
          const inner = (
            <>
              <div
                className={cn(
                  "mb-2 flex h-9 w-9 items-center justify-center rounded-xl",
                  highlight
                    ? "bg-unze-green-muted text-unze-green-dark"
                    : "bg-unze-surface-muted text-unze-ink-secondary",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <p className="text-lg font-bold tracking-tight text-unze-ink">{value}</p>
              <p className="text-xs text-unze-ink-muted">{label}</p>
            </>
          );

          const cardClass = cn(
            "rounded-2xl p-3 shadow-card transition active:scale-[0.98]",
            highlight
              ? "bg-gradient-to-br from-white to-unze-green-muted/30"
              : "bg-white",
          );

          if (href) {
            return (
              <Link key={label} href={href} className={cardClass}>
                {inner}
              </Link>
            );
          }

          return (
            <div key={label} className={cardClass}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
