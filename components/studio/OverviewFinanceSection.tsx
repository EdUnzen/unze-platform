import { formatEuroCents } from "@/lib/business/pricing-utils";
import type { FinanceOverview, StudioRevenueSnapshot } from "@/lib/studio/overview-extras";
import { SECTION_THEMES } from "@/lib/studio/overview-colors";

function FinanceCell({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export function OverviewFinanceSection({
  finance,
  revenue,
}: {
  finance: FinanceOverview;
  revenue: StudioRevenueSnapshot;
}) {
  return (
    <section className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${SECTION_THEMES.finance}`}>
      <div className="border-b border-teal-100 bg-teal-50/50 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-gray-900">Finanzüberblick</h2>
        <p className="text-xs text-gray-500">Offene Beträge, Eingänge & wiederkehrende Erlöse</p>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 sm:p-5">
        <FinanceCell
          label="Offen gesamt"
          value={formatEuroCents(finance.openTotalCents)}
          hint="Unbezahlte Angebote"
        />
        <FinanceCell
          label="30 Tage"
          value={formatEuroCents(finance.paid30dCents)}
          hint="Zahlungseingänge"
        />
        <FinanceCell
          label="Monat"
          value={formatEuroCents(finance.paidMonthCents)}
          hint="Kalendermonat"
        />
        <FinanceCell label="MRR" value={formatEuroCents(finance.mrrCents)} hint="Monatlich wiederkehrend" />
        <FinanceCell
          label="Ø Zahlung"
          value={finance.avgQuoteCents != null ? formatEuroCents(finance.avgQuoteCents) : "—"}
          hint="Bezahlte Angebote"
        />
        <FinanceCell
          label="Domains"
          value={String(revenue.managedDomainCount)}
          hint={`${revenue.activeContractCount} Verträge · Hosting ${formatEuroCents(revenue.hostingMrrCents)}`}
        />
      </div>
    </section>
  );
}
