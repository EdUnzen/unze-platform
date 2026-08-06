import type { ProjectEstimate } from "@/lib/business/project-estimate.service";
import { formatEuroCents, formatEuroRange } from "@/lib/business/pricing-utils";

interface ProjectEstimateCardProps {
  estimate: ProjectEstimate;
}

const MARGIN_LABELS = {
  good: "Gut — über Ziel-€/h",
  ok: "OK — im Zielbereich",
  tight: "Eng — Briefing/Scope strikt",
} as const;

export function ProjectEstimateCard({ estimate }: ProjectEstimateCardProps) {
  const mm = estimate.mastermind;

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
        Automatische Grobschätzung
      </h2>
      <p className="mt-3 text-2xl font-bold text-gray-900">
        {formatEuroRange(estimate.minCents, estimate.maxCents)}
      </p>
      <p className="mt-1 text-sm text-gray-600">
        Empfohlen: {formatEuroCents(estimate.suggestedCents)} · Basis: {estimate.baseCategory} (
        {estimate.baseTier})
      </p>

      <ul className="mt-4 space-y-1.5 text-sm text-gray-700">
        {estimate.lineItems.map((item) => (
          <li key={item.label} className="flex justify-between gap-4">
            <span>{item.label}</span>
            <span className="font-medium">{formatEuroCents(item.amountCents)}</span>
          </li>
        ))}
      </ul>

      {mm ? (
        <div className="mt-5 rounded-lg border border-sky-200/80 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-900">
            Mastermind (intern)
          </p>
          <div className="mt-2 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
            <p>
              <span className="text-gray-500">Stunden (netto):</span>{" "}
              <strong>
                {mm.estimatedHoursMin}–{mm.estimatedHoursMax} h
              </strong>{" "}
              · Mitte {mm.estimatedHoursSuggested} h
            </p>
            <p>
              <span className="text-gray-500">Effektiv:</span>{" "}
              <strong>{formatEuroCents(mm.effectiveHourlyCents)}/h</strong>{" "}
              <span className="text-xs text-gray-500">
                (Ziel ≥ {formatEuroCents(mm.targetEffectiveHourlyCents)}/h)
              </span>
            </p>
            <p>
              <span className="text-gray-500">Listenkosten:</span>{" "}
              {formatEuroCents(mm.internalCostAtListRateCents)} @{" "}
              {formatEuroCents(mm.internalHourlyRateCents)}/h
            </p>
            <p>
              <span className="text-gray-500">Briefing:</span> {mm.briefingScore}% ·{" "}
              {mm.briefingComplete ? "vollständig" : "unvollständig"} ·{" "}
              <span
                className={
                  mm.marginStatus === "good"
                    ? "text-emerald-700"
                    : mm.marginStatus === "ok"
                      ? "text-amber-700"
                      : "text-red-700"
                }
              >
                {MARGIN_LABELS[mm.marginStatus]}
              </span>
            </p>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-gray-600">
            {mm.planningNotes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {estimate.factors.length > 0 ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-gray-500">Berechnungsfaktoren</summary>
          <ul className="mt-2 list-inside list-disc text-xs text-gray-500">
            {estimate.factors.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <p className="mt-4 text-xs text-gray-500">{estimate.disclaimer}</p>
    </section>
  );
}
