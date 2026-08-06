import { formatEuroCents } from "@/lib/business/pricing-utils";
import type { RevenueTrend } from "@/lib/studio/overview-extras";
import { SECTION_THEMES } from "@/lib/studio/overview-colors";

export function OverviewRevenueTrendSection({ trend }: { trend: RevenueTrend }) {
  const hasData = trend.total90dCents > 0;

  return (
    <section
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${SECTION_THEMES.revenue}`}
    >
      <div className="border-b border-emerald-100 bg-emerald-50/50 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-gray-900">Umsatzverlauf</h2>
        <p className="text-xs text-gray-500">
          Zahlungseingänge · letzte 12 Wochen
          {hasData ? (
            <>
              {" "}
              · 30 Tage: {formatEuroCents(trend.total30dCents)} · 90 Tage:{" "}
              {formatEuroCents(trend.total90dCents)}
            </>
          ) : null}
        </p>
      </div>

      {!hasData ? (
        <p className="p-5 text-sm text-gray-500">Noch keine Zahlungseingänge für den Verlauf.</p>
      ) : (
        <div className="p-4 sm:p-5">
          <div className="flex h-40 items-end gap-1.5 sm:gap-2">
            {trend.bars.map((bar) => {
              const heightPct = Math.max(4, Math.round((bar.cents / trend.maxCents) * 100));
              return (
                <div key={bar.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-medium text-gray-500 sm:text-xs">
                    {bar.cents > 0 ? formatEuroCents(bar.cents) : "—"}
                  </span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        bar.isCurrent
                          ? "bg-gradient-to-t from-emerald-600 to-emerald-400 ring-2 ring-emerald-300/50"
                          : bar.cents > 0
                            ? "bg-gradient-to-t from-emerald-500/80 to-emerald-300/70"
                            : "bg-gray-100"
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${bar.label}: ${formatEuroCents(bar.cents)}`}
                    />
                  </div>
                  <span
                    className={`truncate text-[9px] sm:text-[10px] ${
                      bar.isCurrent ? "font-semibold text-emerald-700" : "text-gray-400"
                    }`}
                  >
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
