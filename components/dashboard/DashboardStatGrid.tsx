import type { CommunityDashboardStats } from "@/types/dashboard";
import { Award, FileText, Heart, Users, FolderOpen } from "lucide-react";
import { formatMemberCount } from "@/services/community/community.service";
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
    },
    { label: "Gruppen", value: String(stats.groupCount), icon: FolderOpen },
    { label: "Beiträge", value: String(stats.postCount), icon: FileText },
    {
      label: "Follower",
      value: formatMemberCount(stats.followerCount),
      icon: Heart,
    },
    { label: "Badges", value: String(stats.badgeCount), icon: Award },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map(({ label, value, icon: Icon, href }) => {
        const inner = (
          <>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-unze-green-muted text-unze-green-dark">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <p className="text-lg font-bold tracking-tight text-unze-ink">{value}</p>
            <p className="text-xs text-unze-ink-muted">{label}</p>
          </>
        );

        if (href) {
          return (
            <Link
              key={label}
              href={href}
              className="rounded-2xl bg-white p-3 shadow-card transition active:scale-[0.98]"
            >
              {inner}
            </Link>
          );
        }

        return (
          <div key={label} className="rounded-2xl bg-white p-3 shadow-card">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
