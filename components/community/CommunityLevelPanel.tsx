import { getNextScoreTarget } from "@/lib/community/score-display";
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
  const { score, nextLevel, pointsToNext, breakdown } = levelResult;
  const nextTarget = getNextScoreTarget(nextLevel);

  return (
    <section
      className={cn("rounded-3xl bg-white p-5 shadow-card sm:p-6", className)}
      data-testid="community-score-panel"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-unze-ink-muted">
            Plattform-Metrik
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-unze-ink">Community Score</h2>
        </div>
        <p
          className="text-4xl font-bold tabular-nums tracking-tight text-unze-ink sm:text-3xl"
          aria-label={`Community Score ${score}`}
        >
          {score}
        </p>
      </div>

      <div className="mb-3 h-3.5 overflow-hidden rounded-full bg-unze-surface-muted sm:h-4">
        <div
          className="h-full rounded-full bg-unze-green transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Community Score Fortschritt"
        />
      </div>

      <p className="mb-5 text-sm text-unze-ink-secondary">
        <span className="font-semibold text-unze-ink">{score}</span>
        {" / "}
        100 Punkte
        {nextTarget != null && (
          <>
            {" · "}
            Nächstes Ziel:{" "}
            <span className="font-semibold text-unze-ink">{nextTarget} Punkte</span>
            {pointsToNext > 0 && (
              <span className="text-unze-ink-muted"> ({pointsToNext} fehlen)</span>
            )}
          </>
        )}
      </p>

      <p className="mb-3 text-[11px] font-medium text-unze-ink-muted">
        Automatisch berechnet — nicht manuell einstellbar
      </p>

      <ul className="divide-y divide-unze-border/60 rounded-2xl border border-unze-border/60 bg-unze-surface-muted/30">
        {(Object.entries(breakdown) as [keyof typeof breakdown, number][]).map(
          ([key, value]) => (
            <li
              key={key}
              className="flex items-center justify-between px-3.5 py-2.5 text-sm first:rounded-t-2xl last:rounded-b-2xl"
            >
              <span className="text-unze-ink-secondary">{BREAKDOWN_LABELS[key]}</span>
              <span className="font-semibold tabular-nums text-unze-ink">{value} Pkt</span>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
