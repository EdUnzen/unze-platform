import { formatMemberCount } from "@/services/community/community.service";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, Users } from "lucide-react";

interface DashboardStatusStripProps {
  memberCount: number;
  accessStatusLabel: string;
  openTaskCount: number;
}

export function DashboardStatusStrip({
  memberCount,
  accessStatusLabel,
  openTaskCount,
}: DashboardStatusStripProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs",
        openTaskCount > 0
          ? "border-amber-200 bg-amber-50/80"
          : "border-unze-border bg-white shadow-sm",
      )}
    >
      <span className="inline-flex items-center gap-1 font-medium text-unze-ink">
        <Users className="h-3.5 w-3.5 text-unze-green" aria-hidden />
        {formatMemberCount(memberCount)}
      </span>
      <span className="text-unze-ink-muted">·</span>
      <span className="font-medium text-unze-ink-secondary">{accessStatusLabel}</span>
      {openTaskCount > 0 ? (
        <>
          <span className="text-unze-ink-muted">·</span>
          <span className="inline-flex items-center gap-1 font-semibold text-amber-900">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden />
            {openTaskCount} offen
          </span>
        </>
      ) : (
        <>
          <span className="text-unze-ink-muted">·</span>
          <span className="font-medium text-unze-green-dark">Alles erledigt</span>
        </>
      )}
    </div>
  );
}
