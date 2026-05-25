import { AttentionBadge } from "@/components/dashboard/StatusBadge";
import { canReviewApplications } from "@/lib/permissions/community.permissions";
import { hasCommunityPermission } from "@/lib/permissions/community.permissions";
import type { CommunityRole } from "@/types/database";
import { ClipboardList, Settings, Shield } from "lucide-react";
import Link from "next/link";

interface DashboardAttentionPanelProps {
  slug: string;
  pendingApplications: number;
  pendingReports: number;
  accessStatusLabel: string;
  viewerRole: CommunityRole;
}

export function DashboardAttentionPanel({
  slug,
  pendingApplications,
  pendingReports,
  accessStatusLabel,
  viewerRole,
}: DashboardAttentionPanelProps) {
  const canReview = canReviewApplications(viewerRole);
  const canModerate = hasCommunityPermission(viewerRole, "moderate");

  return (
    <section
      className="rounded-3xl bg-white p-4 shadow-card"
      data-testid="dashboard-attention-panel"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-unze-surface-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-unze-ink-secondary">
          {accessStatusLabel}
        </span>
        {pendingApplications > 0 && canReview && (
          <AttentionBadge count={pendingApplications} label="Offene Anträge" />
        )}
        {pendingReports > 0 && canModerate && (
          <AttentionBadge count={pendingReports} label="Offene Meldungen" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {canReview && (
          <Link
            href={`/dashboard/community/${slug}/requests`}
            data-testid="dashboard-link-requests"
            className="flex items-center gap-3 rounded-2xl border border-unze-border bg-unze-surface-muted/40 px-3 py-3 active:scale-[0.98]"
          >
            <ClipboardList className="h-5 w-5 text-unze-green" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-unze-ink">Anträge</p>
              <p className="text-xs text-unze-ink-secondary">
                {pendingApplications > 0
                  ? `${pendingApplications} warten auf Prüfung`
                  : "Keine offenen Anträge"}
              </p>
            </div>
            {pendingApplications > 0 && (
              <AttentionBadge count={pendingApplications} />
            )}
          </Link>
        )}

        {canModerate && (
          <Link
            href={`/dashboard/community/${slug}/moderation`}
            data-testid="dashboard-link-moderation"
            className="flex items-center gap-3 rounded-2xl border border-unze-border bg-unze-surface-muted/40 px-3 py-3 active:scale-[0.98]"
          >
            <Shield className="h-5 w-5 text-unze-green" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-unze-ink">Moderation</p>
              <p className="text-xs text-unze-ink-secondary">
                {pendingReports > 0
                  ? `${pendingReports} offene Meldung${pendingReports === 1 ? "" : "en"}`
                  : "Meldungen & Strikes"}
              </p>
            </div>
            {pendingReports > 0 && <AttentionBadge count={pendingReports} />}
          </Link>
        )}

        <Link
          href={`/dashboard/community/${slug}/access`}
          data-testid="dashboard-link-access"
          className="flex items-center gap-3 rounded-2xl border border-unze-border bg-unze-surface-muted/40 px-3 py-3 active:scale-[0.98]"
        >
          <Settings className="h-5 w-5 text-unze-green" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-unze-ink">Zugang</p>
            <p className="text-xs text-unze-ink-secondary">
              Join-Modus & Fragen
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
