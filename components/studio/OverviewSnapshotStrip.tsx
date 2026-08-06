import { formatEuroCents } from "@/lib/business/pricing-utils";

import type { FinanceOverview, PeriodSnapshot } from "@/lib/studio/overview-extras";

import { KPI_THEMES } from "@/lib/studio/overview-colors";



function Kpi({

  label,

  value,

  hint,

  theme,

}: {

  label: string;

  value: string;

  hint?: string;

  theme: string;

}) {

  return (

    <div className={`rounded-xl border p-4 shadow-sm ${theme}`}>

      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>

      <p className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">{value}</p>

      {hint ? <p className="mt-1 text-xs text-gray-600">{hint}</p> : null}

    </div>

  );

}



export function OverviewSnapshotStrip({

  stats,

  period,

  finance,

}: {

  stats: {

    openLeads: number;

    activeClients: number;

    openPayments: number;

    partialPayments: number;

    contractReminders: number;

    domainReminders: number;

  };

  period: PeriodSnapshot;

  finance: FinanceOverview;

}) {

  const attentionCount =

    stats.contractReminders + stats.domainReminders + period.openQuotesCount;



  return (

    <section>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">

        <div>

          <h2 className="text-sm font-semibold text-gray-900">Cockpit auf einen Blick</h2>

          <p className="text-xs text-gray-500">Leads, Geld & Fristen — aktueller Stand</p>

        </div>

        {attentionCount > 0 ? (

          <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">

            {attentionCount} Punkt{attentionCount === 1 ? "" : "e"} brauchen Aufmerksamkeit

          </p>

        ) : (

          <p className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200">

            Keine dringenden Fristen

          </p>

        )}

      </div>



      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">

        <Kpi

          label="Offene Leads"

          value={String(stats.openLeads)}

          hint={`+${period.leadsWeek} diese Woche`}

          theme={KPI_THEMES.leads}

        />

        <Kpi

          label="Neu heute"

          value={String(period.leadsToday)}

          hint={`${period.leadsMonth} in 30 Tagen`}

          theme={KPI_THEMES.today}

        />

        <Kpi label="Kunden aktiv" value={String(stats.activeClients)} theme={KPI_THEMES.clients} />

        <Kpi

          label="Offen (€)"

          value={formatEuroCents(finance.openTotalCents)}

          hint={`${stats.openPayments + stats.partialPayments} Angebote`}

          theme={KPI_THEMES.open}

        />

        <Kpi

          label="Eingänge Monat"

          value={formatEuroCents(finance.paidMonthCents)}

          hint={`${formatEuroCents(period.paymentsWeekCents)} diese Woche`}

          theme={KPI_THEMES.income}

        />

        <Kpi

          label="MRR"

          value={formatEuroCents(finance.mrrCents)}

          hint="Verträge + Hosting"

          theme={KPI_THEMES.mrr}

        />

      </div>

    </section>

  );

}

