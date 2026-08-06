import type { QuotePipelineStage } from "@/lib/studio/overview-extras";

import { QUOTE_STATUS_THEMES } from "@/lib/studio/overview-colors";

import Link from "next/link";



export function OverviewQuotePipelineSection({ stages }: { stages: QuotePipelineStage[] }) {

  const total = stages.reduce((sum, stage) => sum + stage.count, 0);



  return (

    <section

      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${QUOTE_STATUS_THEMES.sent.section}`}

    >

      <div className={`border-b border-sky-100 px-4 py-3 sm:px-5 ${QUOTE_STATUS_THEMES.sent.header}`}>

        <h2 className="text-sm font-semibold text-gray-900">Angebots-Pipeline</h2>

        <p className="text-xs text-gray-500">

          {total} Angebot{total === 1 ? "" : "e"} · Klick filtert Angebote

        </p>

      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">

        {stages.map((stage) => {

          const theme = QUOTE_STATUS_THEMES[stage.status];

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

