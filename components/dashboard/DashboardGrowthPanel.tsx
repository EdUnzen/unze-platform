import type { CommunityDashboardStats } from "@/types/dashboard";
import {
  formatShareCountLabel,
  formatWeeklyViewsLabel,
} from "@/lib/utils/format-metrics";
import { cn } from "@/lib/utils/cn";
import { Eye, Share2, Sparkles, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

interface DashboardGrowthPanelProps {
  slug: string;
  stats: CommunityDashboardStats;
  communityTitle: string;
}

export function DashboardGrowthPanel({
  slug,
  stats,
  communityTitle,
}: DashboardGrowthPanelProps) {
  const hasGrowth =
    (stats.weeklyViews ?? 0) > 0 ||
    (stats.shareCount ?? 0) > 0 ||
    stats.followerCount > 0;

  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-unze-green/10 via-white to-emerald-50/80 p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-unze-green" aria-hidden />
            <h2 className="text-sm font-semibold text-unze-ink">Wachstum & Reichweite</h2>
          </div>
          <p className="text-xs text-unze-ink-secondary">
            {hasGrowth
              ? `${communityTitle} gewinnt Sichtbarkeit — teile weiter für mehr Reichweite.`
              : "Teile deine Community, um Aufrufe und Mitglieder zu steigern."}
          </p>
        </div>
        <Link
          href={`/community/${slug}`}
          className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-[11px] font-semibold text-unze-green-dark shadow-sm"
        >
          Teilen →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <GrowthChip icon={Users} label="Mitglieder" value={String(stats.memberCount)} highlight />
        <GrowthChip
          icon={Eye}
          label="Aufrufe/Woche"
          value={
            stats.weeklyViews && stats.weeklyViews > 0
              ? formatWeeklyViewsLabel(stats.weeklyViews).replace(" Aufrufe diese Woche", "")
              : "—"
          }
        />
        <GrowthChip
          icon={Share2}
          label="Shares"
          value={
            stats.shareCount && stats.shareCount > 0
              ? formatShareCountLabel(stats.shareCount).replace(" geteilt", "")
              : "—"
          }
        />
        <GrowthChip icon={TrendingUp} label="Follower" value={String(stats.followerCount)} />
      </div>

      <p className="mt-3 rounded-xl bg-white/60 px-3 py-2 text-[11px] text-unze-ink-secondary">
        Einnahmen & Revenue Share — Sandbox unter Dashboard → Einnahmen & Referrals.
      </p>
    </section>
  );
}

function GrowthChip({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl p-3", highlight ? "bg-white shadow-sm" : "bg-white/70")}>
      <Icon
        className={cn("mb-1.5 h-4 w-4", highlight ? "text-unze-green" : "text-unze-ink-muted")}
        aria-hidden
      />
      <p className="text-base font-bold tracking-tight text-unze-ink">{value}</p>
      <p className="text-[10px] text-unze-ink-muted">{label}</p>
    </div>
  );
}
