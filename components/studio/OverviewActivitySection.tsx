import { formatInquiryDate } from "@/lib/studio/overview-extras";

import type { ActivityFeedItem } from "@/lib/studio/overview-extras";

import { SECTION_THEMES } from "@/lib/studio/overview-colors";

import Link from "next/link";



const KIND_LABELS: Record<ActivityFeedItem["kind"], string> = {

  lead: "Lead",

  payment: "Zahlung",

  quote: "Angebot",

};



const KIND_STYLES: Record<ActivityFeedItem["kind"], string> = {

  lead: "bg-blue-100 text-blue-800 ring-blue-200",

  payment: "bg-emerald-100 text-emerald-800 ring-emerald-200",

  quote: "bg-violet-100 text-violet-800 ring-violet-200",

};



export function OverviewActivitySection({ items }: { items: ActivityFeedItem[] }) {

  return (

    <section

      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${SECTION_THEMES.activity}`}

    >

      <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-5">

        <h2 className="text-sm font-semibold text-gray-900">Letzte Aktivität</h2>

        <p className="text-xs text-gray-500">Leads, Zahlungen und versendete Angebote</p>

      </div>

      {items.length === 0 ? (

        <p className="p-5 text-sm text-gray-500">Noch keine Aktivität erfasst.</p>

      ) : (

        <ul className="divide-y divide-gray-100">

          {items.map((item) => (

            <li key={item.id}>

              <Link

                href={item.href}

                className="flex flex-wrap items-start justify-between gap-3 p-4 transition hover:bg-gray-50 sm:p-5"

              >

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <span

                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${KIND_STYLES[item.kind]}`}

                    >

                      {KIND_LABELS[item.kind]}

                    </span>

                    <p className="text-sm font-medium text-gray-900">{item.title}</p>

                  </div>

                  <p className="mt-1 text-xs text-gray-500">{item.subtitle}</p>

                </div>

                <time className="shrink-0 text-xs text-gray-400" dateTime={item.at}>

                  {formatInquiryDate(item.at)}

                </time>

              </Link>

            </li>

          ))}

        </ul>

      )}

    </section>

  );

}

