import type { PipelineStage } from "@/lib/studio/overview-extras";

import { LEAD_STATUS_THEMES } from "@/lib/studio/overview-colors";

import Link from "next/link";



export function OverviewPipelineSection({ pipeline }: { pipeline: PipelineStage[] }) {

  const total = pipeline.reduce((sum, stage) => sum + stage.count, 0);



  return (

    <section

      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${LEAD_STATUS_THEMES.neue_anfrage.section}`}

    >

      <div className={`border-b border-blue-100 px-4 py-3 sm:px-5 ${LEAD_STATUS_THEMES.neue_anfrage.header}`}>

        <h2 className="text-sm font-semibold text-gray-900">Lead-Pipeline</h2>

        <p className="text-xs text-gray-500">{total} Leads · Klick filtert die Lead-Liste</p>

      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5 sm:p-5">

        {pipeline.map((stage) => {

          const theme = LEAD_STATUS_THEMES[stage.status];

          return (

            <Link

              key={stage.status}

              href={stage.href}

              className={`rounded-xl border px-4 py-3 text-center transition ${theme.card} ${theme.cardHover}`}

            >

              <p className={`text-2xl font-bold ${theme.count}`}>{stage.count}</p>

              <p className={`mt-1 text-xs font-medium ${theme.label}`}>{stage.label}</p>

            </Link>

          );

        })}

      </div>

    </section>

  );

}

