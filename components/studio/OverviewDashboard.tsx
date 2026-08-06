import { OverviewActivitySection } from "@/components/studio/OverviewActivitySection";

import { OverviewAnalysisPipelineSection } from "@/components/studio/OverviewAnalysisPipelineSection";

import { OverviewFinanceSection } from "@/components/studio/OverviewFinanceSection";

import { OverviewLeadTypesSection } from "@/components/studio/OverviewLeadTypesSection";

import { OverviewPipelineSection } from "@/components/studio/OverviewPipelineSection";

import { OverviewQuickLinks } from "@/components/studio/OverviewQuickLinks";

import { OverviewQuotePipelineSection } from "@/components/studio/OverviewQuotePipelineSection";

import { OverviewRecentClientsSection } from "@/components/studio/OverviewRecentClientsSection";

import { OverviewRecentInquiries } from "@/components/studio/OverviewRecentInquiries";

import { OverviewRevenueSection } from "@/components/studio/OverviewRevenueSection";

import { OverviewRevenueTrendSection } from "@/components/studio/OverviewRevenueTrendSection";
import { OverviewSnapshotStrip } from "@/components/studio/OverviewSnapshotStrip";

import { OverviewSystemStatusSection } from "@/components/studio/OverviewSystemStatusSection";

import { OverviewTodaySection } from "@/components/studio/OverviewTodaySection";

import { ProductOverviewSection } from "@/components/studio/ProductOverviewSection";

import { formatEuroCents } from "@/lib/business/pricing-utils";

import {

  buildContractReminderMailto,

  buildDomainReminderMailto,

  buildPaymentReminderMailto,

} from "@/lib/studio/outreach";

import { CONTRACT_TYPE_LABELS } from "@/lib/studio/client-types";

import type { StudioOverview } from "@/lib/studio/overview";

import Link from "next/link";



function MailtoButton({ href, label }: { href: string; label?: string }) {

  return (

    <a

      href={href}

      className="inline-flex shrink-0 items-center rounded-lg border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 active:bg-emerald-50"

    >

      {label ?? "Anschreiben"}

    </a>

  );

}



export function OverviewDashboard({ data }: { data: StudioOverview }) {

  const {

    stats,

    payments,

    recentPaid,

    contractReminders,

    domainReminders,

    products,

    analyticsConnected,

    analyticsSource,

    todayActions,

    pipeline,

    recentInquiries,

    revenue,

    analysisPipeline,

    recentActivity,

    systemStatus,

    leadTypes,

    quotePipeline,

    period,

    finance,

    recentClients,

    revenueTrend,

  } = data;



  return (

    <div className="space-y-8">

      <OverviewQuickLinks />



      <OverviewSnapshotStrip stats={stats} period={period} finance={finance} />



      <OverviewTodaySection actions={todayActions} />



      <div className="grid gap-8 xl:grid-cols-2">

        <OverviewPipelineSection pipeline={pipeline} />

        <OverviewQuotePipelineSection stages={quotePipeline} />

      </div>



      <div className="grid gap-8 xl:grid-cols-2">

        <OverviewAnalysisPipelineSection stages={analysisPipeline} />

        <OverviewLeadTypesSection rows={leadTypes} />

      </div>



      <OverviewFinanceSection finance={finance} revenue={revenue} />



      <OverviewRevenueTrendSection trend={revenueTrend} />



      <OverviewRevenueSection revenue={revenue} />



      <div className="grid gap-8 lg:grid-cols-2">

        <OverviewActivitySection items={recentActivity} />

        <OverviewSystemStatusSection items={systemStatus} />

      </div>



      <div className="grid gap-8 xl:grid-cols-2">

        <OverviewRecentInquiries inquiries={recentInquiries} />

        <OverviewRecentClientsSection clients={recentClients} />

      </div>



      <ProductOverviewSection

        products={products}

        analyticsConnected={analyticsConnected}

        analyticsSource={analyticsSource}

      />



      {(stats.contractReminders > 0 || stats.domainReminders > 0) ? (

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">

          {stats.contractReminders > 0 ? `${stats.contractReminders} Vertrag/Abrechnung` : ""}

          {stats.contractReminders > 0 && stats.domainReminders > 0 ? " · " : ""}

          {stats.domainReminders > 0 ? `${stats.domainReminders} Domain(s)` : ""}

          {" "} — prüfen und ggf. anschreiben.

        </p>

      ) : null}



      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-4 py-3 sm:px-5">

          <h2 className="text-sm font-semibold text-gray-900">Offene & teilbezahlte Angebote</h2>

          <p className="text-xs text-gray-500">

            {formatEuroCents(finance.openTotalCents)} offen · „Anschreiben“ öffnet einen Mail-Entwurf

          </p>

        </div>

        {payments.length === 0 ? (

          <p className="p-5 text-sm text-gray-500">Keine offenen Zahlungen.</p>

        ) : (

          <ul className="divide-y divide-gray-100">

            {payments.map((row) => (

              <li key={row.quote.id} className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">

                <div className="min-w-0">

                  <Link

                    href={`/studio/app/angebote/${row.quote.id}`}

                    className="font-mono text-sm font-semibold text-emerald-700 hover:underline"

                  >

                    {row.quote.referenceId}

                  </Link>

                  <p className="mt-1 text-sm text-gray-900">

                    {row.quote.company ?? row.quote.customerName ?? row.quote.customerEmail}

                  </p>

                  <p className="text-xs text-gray-500">

                    {row.bucket === "partial" ? "Teilzahlung" : "Offen"} ·{" "}

                    {formatEuroCents(row.openCents)} offen

                    {row.bucket === "partial"

                      ? ` (${formatEuroCents(row.quote.amountPaidCents)} bezahlt)`

                      : ""}

                  </p>

                </div>

                <MailtoButton href={buildPaymentReminderMailto(row)} />

              </li>

            ))}

          </ul>

        )}

      </section>



      <div className="grid gap-8 xl:grid-cols-2">

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-4 py-3 sm:px-5">

            <h2 className="text-sm font-semibold text-gray-900">Verträge & Abrechnungen</h2>

            <p className="text-xs text-gray-500">Nächste 14 Tage Abrechnung · Vertragsende 30 Tage</p>

          </div>

          {contractReminders.length === 0 ? (

            <p className="p-5 text-sm text-gray-500">Keine fälligen Verträge in diesem Zeitraum.</p>

          ) : (

            <ul className="divide-y divide-gray-100">

              {contractReminders.map((row) => (

                <li

                  key={`${row.contract.id}-${row.reason}`}

                  className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5"

                >

                  <div className="min-w-0">

                    <Link

                      href={`/studio/app/kunden/${row.client.id}`}

                      className="text-sm font-semibold text-gray-900 hover:text-emerald-700"

                    >

                      {row.client.companyName}

                    </Link>

                    <p className="mt-1 text-sm text-gray-700">{row.contract.title}</p>

                    <p className="text-xs text-gray-500">

                      {row.reason === "billing_due" ? "Abrechnung" : "Vertragsende"} in{" "}

                      {row.daysLeft} Tag{row.daysLeft === 1 ? "" : "en"} ·{" "}

                      {CONTRACT_TYPE_LABELS[row.contract.contractType]}

                      {row.contract.amountCents != null

                        ? ` · ${formatEuroCents(row.contract.amountCents)}`

                        : ""}

                    </p>

                  </div>

                  <MailtoButton href={buildContractReminderMailto(row)} />

                </li>

              ))}

            </ul>

          )}

        </section>



        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-4 py-3 sm:px-5">

            <h2 className="text-sm font-semibold text-gray-900">Domains</h2>

            <p className="text-xs text-gray-500">Ablauf in den nächsten 60 Tagen</p>

          </div>

          {domainReminders.length === 0 ? (

            <p className="p-5 text-sm text-gray-500">Keine Domains laufen bald ab.</p>

          ) : (

            <ul className="divide-y divide-gray-100">

              {domainReminders.map((row) => (

                <li key={row.domain.id} className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">

                  <div className="min-w-0">

                    <p className="font-medium text-gray-900">{row.domain.domain}</p>

                    <Link

                      href={`/studio/app/kunden/${row.client.id}`}

                      className="text-sm text-emerald-700 hover:underline"

                    >

                      {row.client.companyName}

                    </Link>

                    <p className="text-xs text-gray-500">

                      in {row.daysLeft} Tag{row.daysLeft === 1 ? "" : "en"}

                      {row.domain.autoRenew ? " · Auto-Renew" : ""}

                    </p>

                  </div>

                  <MailtoButton href={buildDomainReminderMailto(row)} />

                </li>

              ))}

            </ul>

          )}

        </section>

      </div>



      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-4 py-3 sm:px-5">

          <h2 className="text-sm font-semibold text-gray-900">Zuletzt bezahlt</h2>

        </div>

        {recentPaid.length === 0 ? (

          <p className="p-5 text-sm text-gray-500">Noch keine Zahlungseingänge erfasst.</p>

        ) : (

          <ul className="divide-y divide-gray-100">

            {recentPaid.map((q) => (

              <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">

                <div>

                  <Link

                    href={`/studio/app/angebote/${q.id}`}

                    className="font-mono text-sm font-semibold text-emerald-700 hover:underline"

                  >

                    {q.referenceId}

                  </Link>

                  <p className="text-xs text-gray-500">

                    {q.company ?? q.customerName} · {formatEuroCents(q.amountPaidCents)}

                    {q.paidAt ? ` · ${new Date(q.paidAt).toLocaleDateString("de-DE")}` : ""}

                  </p>

                </div>

                <Link

                  href={`/studio/app/rechnungen/${q.id}/pdf`}

                  className="text-xs font-medium text-gray-600 underline"

                >

                  Rechnung

                </Link>

              </li>

            ))}

          </ul>

        )}

      </section>

    </div>

  );

}


