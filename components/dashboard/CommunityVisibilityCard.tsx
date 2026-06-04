import { getVisibilityDisplayLabel } from "@/lib/constants/visibility-display";
import { VISIBILITY_OPTIONS } from "@/lib/constants/community";
import type { CommunityVisibility } from "@/types/community";
import { Eye, Settings } from "lucide-react";
import Link from "next/link";

interface CommunityVisibilityCardProps {
  slug: string;
  visibility: CommunityVisibility;
  discoverEnabled: boolean;
  monetizationEnabled: boolean;
}

export function CommunityVisibilityCard({
  slug,
  visibility,
  discoverEnabled,
  monetizationEnabled,
}: CommunityVisibilityCardProps) {
  const label = getVisibilityDisplayLabel(visibility);
  const hint = VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.hint;

  return (
    <div className="rounded-3xl border border-unze-border/80 bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-unze-green-muted text-unze-green-dark">
          <Eye className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-unze-ink">Sichtbarkeit & Zugang</h3>
          <p className="mt-1 text-xs text-unze-ink-secondary">
            Aktuell: <strong className="text-unze-ink">{label}</strong>
            {discoverEnabled ? " · In Discover" : " · Nicht in Discover"}
            {monetizationEnabled ? " · Monetarisierung aktiv" : " · Kostenlos"}
          </p>
          {hint && <p className="mt-1.5 text-[11px] text-unze-green-dark">{hint}</p>}
        </div>
      </div>
      <Link
        href={`/dashboard/community/${slug}/settings`}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-unze-green"
      >
        <Settings className="h-3.5 w-3.5" aria-hidden />
        Sichtbarkeit in Einstellungen ändern
      </Link>
    </div>
  );
}
