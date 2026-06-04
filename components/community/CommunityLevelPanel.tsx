import { CommunityLevelBadge } from "@/components/community/CommunityLevelBadge";
import { COMMUNITY_LEVEL_LABELS } from "@/lib/constants/community-level";
import type { CommunityLevelResult } from "@/lib/community/compute-level";
import { cn } from "@/lib/utils/cn";

interface CommunityLevelPanelProps {
  levelResult: CommunityLevelResult;
  className?: string;
}

const BREAKDOWN_LABELS: Record<keyof CommunityLevelResult["breakdown"], string> = {
  rating: "Ø Bewertung",
  groups: "Aktive Gruppen",
  offerings: "Events & Services",
  verification: "Verifizierung",
  members: "Mitglieder",
  activity: "Aktivität",
};

export function CommunityLevelPanel({ levelResult, className }: CommunityLevelPanelProps) {
  const { level, score, nextLevel, pointsToNext, breakdown } = levelResult;
  return (
    <section
      className={cn("rounded-3xl bg-white p-4 shadow-card", className)}
      data-testid="community-level-panel"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-unze-ink">Community-Level</h2>
        <CommunityLevelBadge level={level} />
      </div>

      <div className="mb-2 h-2 overflow-hidden rounded-full bg-unze-surface-muted">
        <div
          className="h-full rounded-full bg-unze-green transition-all"
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="mb-4 text-xs text-unze-ink-secondary">
        {score} / 100 Punkte
        {nextLevel && (
          <>
            {" "}
            · Nächstes Ziel:{" "}
            <strong className="text-unze-ink">{COMMUNITY_LEVEL_LABELS[nextLevel]}</strong>
            {pointsToNext > 0 && ` (${pointsToNext} Punkte)`}
          </>
        )}
      </p>

      <p className="mb-2 text-[11px] font-medium text-unze-ink-muted">
        Automatisch berechnet — nicht manuell einstellbar
      </p>
      <ul className="space-y-1.5">
        {(Object.entries(breakdown) as [keyof typeof breakdown, number][]).map(
          ([key, value]) => (
            <li key={key} className="flex items-center justify-between text-xs">
              <span className="text-unze-ink-secondary">{BREAKDOWN_LABELS[key]}</span>
              <span className="font-semibold text-unze-ink">{value} Pkt</span>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
