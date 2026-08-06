import { InquiryStatusBadge } from "@/components/studio/InquiryStatusBadge";
import { inquirySubtitle } from "@/lib/studio/overview-extras";
import { LEAD_STATUS_THEMES } from "@/lib/studio/overview-colors";
import type { StudioInquiry, StudioInquiryStatus } from "@/lib/studio/types";
import Link from "next/link";

export function OverviewRecentInquiries({ inquiries }: { inquiries: StudioInquiry[] }) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${LEAD_STATUS_THEMES.neue_anfrage.section}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 bg-blue-50/50 px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Neueste Anfragen</h2>
          <p className="text-xs text-gray-500">Letzte eingehende Leads von UNZE Business</p>
        </div>
        <Link href="/studio/app" className="text-xs font-semibold text-emerald-700 hover:underline">
          Alle Leads →
        </Link>
      </div>
      {inquiries.length === 0 ? (
        <p className="p-5 text-sm text-gray-500">Noch keine Anfragen — Test über /business/kontakt</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {inquiries.map((inq) => (
            <li key={inq.id}>
              <Link
                href={`/studio/app/inquiries/${inq.id}`}
                className="flex flex-wrap items-start justify-between gap-3 p-4 transition hover:bg-gray-50 sm:p-5"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-emerald-700">{inq.referenceId}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {inq.company ?? inq.contactName ?? inq.contactEmail}
                  </p>
                  <p className="text-xs text-gray-500">{inquirySubtitle(inq)}</p>
                </div>
                <InquiryStatusBadge status={inq.status as StudioInquiryStatus} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
