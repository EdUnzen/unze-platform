import { formatEuroCents } from "@/lib/business/pricing-utils";
import type { StudioRevenueSnapshot } from "@/lib/studio/overview-extras";

function RevenueRow({
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
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export function OverviewRevenueSection({ revenue }: { revenue: StudioRevenueSnapshot }) {
  const hasRecurring =
    revenue.totalMrrCents > 0 ||
    revenue.activeContractCount > 0 ||
    revenue.managedDomainCount > 0;

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-gray-900">Wiederkehrende Erlöse (MRR)</h2>
        <p className="text-xs text-gray-500">
          Verträge & Hosting aktiver Kunden · Domains als Vorbereitung für spätere Produkte
        </p>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
        <RevenueRow
          label="MRR gesamt"
          value={formatEuroCents(revenue.totalMrrCents)}
          hint={hasRecurring ? "Monatlich wiederkehrend" : "Noch keine Verträge/Hosting hinterlegt"}
        />
        <RevenueRow
          label="Verträge"
          value={formatEuroCents(revenue.contractMrrCents)}
          hint={`${revenue.activeContractCount} aktive Verträge`}
        />
        <RevenueRow
          label="Hosting"
          value={formatEuroCents(revenue.hostingMrrCents)}
          hint="client_hosting · monatlich"
        />
        <RevenueRow
          label="Domains verwaltet"
          value={String(revenue.managedDomainCount)}
          hint="Bei aktiven Kunden · Erinnerungen unten"
        />
      </div>
    </section>
  );
}
