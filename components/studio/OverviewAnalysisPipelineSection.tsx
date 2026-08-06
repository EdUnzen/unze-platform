import type { AnalysisPipelineStage } from "@/lib/studio/overview-extras";

import { ANALYSIS_STAGE_THEMES } from "@/lib/studio/overview-colors";

import Link from "next/link";



export function OverviewAnalysisPipelineSection({

  stages,

}: {

  stages: AnalysisPipelineStage[];

}) {

  const total = stages.reduce((sum, stage) => sum + stage.count, 0);



  if (total === 0) {

    return (

      <section className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-5 sm:px-5">

        <h2 className="text-sm font-semibold text-gray-900">Analyse-Pipeline</h2>

        <p className="mt-1 text-xs text-gray-500">

          Noch keine Analyse-Anfragen ·{" "}

          <Link href="/business/analyse" className="font-medium text-orange-700 hover:underline">

            Business Analyse

          </Link>

        </p>

      </section>

    );

  }



  return (

    <section

      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${ANALYSIS_STAGE_THEMES.payment_pending.section}`}

    >

      <div

        className={`border-b border-orange-100 px-4 py-3 sm:px-5 ${ANALYSIS_STAGE_THEMES.payment_pending.header}`}

      >

        <h2 className="text-sm font-semibold text-gray-900">Analyse-Pipeline</h2>

        <p className="text-xs text-gray-500">

          {total} Analyse-Anfrage{total === 1 ? "" : "n"} · Quick / Business / Premium

        </p>

      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">

        {stages.map((stage) => {

          const theme = ANALYSIS_STAGE_THEMES[stage.id];

          return (

            <Link

              key={stage.id}

              href={stage.href}

              className={`rounded-xl border px-4 py-3 transition ${theme.card} ${theme.cardHover}`}

            >

              <p className={`text-2xl font-bold ${theme.count}`}>{stage.count}</p>

              <p className={`mt-1 text-sm font-medium ${theme.label}`}>{stage.label}</p>

              <p className="mt-0.5 text-xs text-gray-500">{stage.hint}</p>

            </Link>

          );

        })}

      </div>

    </section>

  );

}

