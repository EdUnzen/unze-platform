import { InquiryStatusBadge } from "@/components/studio/InquiryStatusBadge";

import { LeadStatusFilter } from "@/components/studio/LeadStatusFilter";

import { STUDIO_INQUIRY_STATUS_LABELS } from "@/lib/studio/constants";

import { inquiryTypeLabel } from "@/lib/studio/overview-extras";

import { listStudioInquiries } from "@/lib/studio/inquiries";

import type { StudioInquiryStatus } from "@/lib/studio/types";

import Link from "next/link";



const OPEN_STATUSES: StudioInquiryStatus[] = [

  "neue_anfrage",

  "kontaktiert",

  "angebot",

  "zahlung_ausstehend",

];



function formatDate(iso: string): string {

  return new Intl.DateTimeFormat("de-DE", {

    dateStyle: "medium",

    timeStyle: "short",

  }).format(new Date(iso));

}



function isValidStatus(value: string | undefined): value is StudioInquiryStatus {

  return value != null && value in STUDIO_INQUIRY_STATUS_LABELS;

}



type PageProps = {

  searchParams: Promise<{

    status?: string;

    type?: string;

    open?: string;

  }>;

};



export default async function StudioAppPage({ searchParams }: PageProps) {

  const { status: statusParam, type: typeParam, open: openParam } = await searchParams;

  const statusFilter = isValidStatus(statusParam) ? statusParam : undefined;

  const typeFilter = typeParam?.trim() || undefined;

  const openAnalysis = openParam === "1" && typeFilter === "analysis";



  const allInquiries = await listStudioInquiries(200);



  const statusCounts = allInquiries.reduce(

    (acc, inq) => {

      acc[inq.status as StudioInquiryStatus] =

        (acc[inq.status as StudioInquiryStatus] ?? 0) + 1;

      return acc;

    },

    {} as Partial<Record<StudioInquiryStatus, number>>,

  );



  let inquiries = allInquiries;



  if (openAnalysis) {

    inquiries = inquiries.filter(

      (i) =>

        i.inquiryType === "analysis" &&

        ["neue_anfrage", "kontaktiert", "angebot"].includes(i.status),

    );

  } else {

    if (statusFilter) {

      inquiries = inquiries.filter((i) => i.status === statusFilter);

    }

    if (typeFilter) {

      inquiries = inquiries.filter((i) => i.inquiryType === typeFilter);

    }

  }



  const openCount = allInquiries.filter((i) => OPEN_STATUSES.includes(i.status as StudioInquiryStatus))

    .length;



  const filterLabel = openAnalysis

    ? "Analyse · In Bearbeitung"

    : [

        typeFilter ? inquiryTypeLabel(typeFilter) : null,

        statusFilter ? STUDIO_INQUIRY_STATUS_LABELS[statusFilter] : null,

      ]

        .filter(Boolean)

        .join(" · ");



  return (

    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

      <div>

        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">

          Leads

        </h1>

        <p className="mt-1 text-sm text-gray-600">

          {openCount} offen · {allInquiries.length} gesamt

          {filterLabel ? (

            <>

              {" "}

              · Filter: <span className="font-medium text-gray-800">{filterLabel}</span>

            </>

          ) : null}

        </p>

      </div>



      <div className="mt-6 space-y-3">

        <LeadStatusFilter active={statusFilter} type={typeFilter} counts={statusCounts} />

        {(statusFilter || typeFilter || openAnalysis) ? (

          <Link

            href="/studio/app"

            className="inline-flex text-xs font-semibold text-emerald-700 hover:underline"

          >

            Filter zurücksetzen

          </Link>

        ) : null}

      </div>



      <section className="mt-8">

        {inquiries.length === 0 ? (

          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">

            <p className="text-sm text-gray-500">

              {filterLabel ? "Keine Leads für diesen Filter." : "Noch keine Anfragen vorhanden."}

            </p>

            {!filterLabel ? (

              <>

                <p className="mt-2 text-xs text-gray-400">

                  Neue Leads von unze.app/business erscheinen hier automatisch.

                </p>

                <Link

                  href="/studio/app/schaetzung-test"

                  className="mt-4 inline-block text-sm font-medium text-emerald-700 underline"

                >

                  3 Test-Anfragen anlegen →

                </Link>

              </>

            ) : (

              <Link

                href="/studio/app"

                className="mt-4 inline-block text-sm font-medium text-emerald-700 underline"

              >

                Alle Leads anzeigen

              </Link>

            )}

          </div>

        ) : (

          <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            {inquiries.map((inq) => (

              <li key={inq.id}>

                <Link

                  href={`/studio/app/inquiries/${inq.id}`}

                  className="block p-4 transition hover:bg-gray-50 sm:p-5"

                >

                  <div className="flex flex-wrap items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="font-mono text-sm font-semibold text-emerald-700">

                        {inq.referenceId}

                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">

                        {inq.contactName ?? "Unbekannt"} · {inq.contactEmail}

                      </p>

                      {inq.company ? (

                        <p className="text-xs text-gray-500">{inq.company}</p>

                      ) : null}

                      <p className="mt-1 text-xs text-gray-400">

                        {inquiryTypeLabel(inq.inquiryType)}

                      </p>

                    </div>

                    <InquiryStatusBadge status={inq.status as StudioInquiryStatus} />

                  </div>

                  {inq.message ? (

                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">{inq.message}</p>

                  ) : null}

                  <p className="mt-2 text-xs text-gray-400">{formatDate(inq.createdAt)}</p>

                </Link>

              </li>

            ))}

          </ul>

        )}

      </section>

    </div>

  );

}

