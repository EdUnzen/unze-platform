import { AttentionBadge } from "@/components/dashboard/StatusBadge";
import { canReviewApplications } from "@/lib/permissions/community.permissions";
import { hasCommunityPermission } from "@/lib/permissions/community.permissions";
import type { CommunityRole } from "@/types/database";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, ClipboardList, Settings, Shield, UserMinus } from "lucide-react";
import Link from "next/link";

interface DashboardAttentionPanelProps {
  slug: string;
  pendingApplications: number;
  pendingReports: number;
  pendingRemovals: number;
  accessStatusLabel: string;
  viewerRole: CommunityRole;
}

export function DashboardAttentionPanel({
  slug,
  pendingApplications,
  pendingReports,
  pendingRemovals,
  accessStatusLabel,
  viewerRole,
}: DashboardAttentionPanelProps) {
  const canReview = canReviewApplications(viewerRole);
  const canModerate = hasCommunityPermission(viewerRole, "moderate");
  const canManageMembers = hasCommunityPermission(viewerRole, "manage_members");
  const urgentCount =
    (canReview ? pendingApplications : 0) +
    (canModerate ? pendingReports : 0) +
    (canManageMembers ? pendingRemovals : 0);
  const hasUrgent = urgentCount > 0;

  return (
    <section
      className={cn(
        "rounded-3xl bg-white p-4 shadow-card",
        hasUrgent && "border-l-4 border-amber-400",
      )}
      data-testid="dashboard-attention-panel"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-unze-ink">
            {hasUrgent ? "Aktion erforderlich" : "Community-Steuerung"}
          </h2>
          <p className="mt-0.5 text-xs text-unze-ink-secondary">
            {hasUrgent
              ? `${urgentCount} offene${urgentCount === 1 ? "r" : ""} Punkt${urgentCount === 1 ? "" : "e"} warten auf dich`
              : "Anträge, Moderation und Zugang im Überblick"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-unze-surface-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-unze-ink-secondary">
            {accessStatusLabel}
          </span>
          {hasUrgent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-900">
              <AlertCircle className="h-3 w-3" aria-hidden />
              {urgentCount} offen
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {canReview && (
          <Link
            href={`/dashboard/community/${slug}/requests`}
            data-testid="dashboard-link-requests"
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-3 py-3 active:scale-[0.98]",
              pendingApplications > 0
                ? "border-amber-200 bg-amber-50/80"
                : "border-unze-border bg-unze-surface-muted/40",
            )}
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
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-3 py-3 active:scale-[0.98]",
              pendingReports > 0
                ? "border-amber-200 bg-amber-50/80"
                : "border-unze-border bg-unze-surface-muted/40",
            )}
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

        {canManageMembers && (
          <Link
            href={`/dashboard/community/${slug}/members`}
            data-testid="dashboard-link-removals"
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-3 py-3 active:scale-[0.98]",
              pendingRemovals > 0
                ? "border-amber-200 bg-amber-50/80"
                : "border-unze-border bg-unze-surface-muted/40",
            )}
          >
            <UserMinus className="h-5 w-5 text-unze-green" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-unze-ink">Zu entfernen</p>
              <p className="text-xs text-unze-ink-secondary">
                {pendingRemovals > 0
                  ? `${pendingRemovals} aus externen Kanälen entfernen`
                  : "Keine offenen Entfernungen"}
              </p>
            </div>
            {pendingRemovals > 0 && (
              <AttentionBadge count={pendingRemovals} />
            )}
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
