import { STUDIO_INQUIRY_STATUS_LABELS, STUDIO_INQUIRY_STATUSES } from "@/lib/studio/constants";
import { LEAD_STATUS_THEMES } from "@/lib/studio/overview-colors";
import type { StudioInquiryStatus } from "@/lib/studio/types";
import Link from "next/link";

type FilterValue = StudioInquiryStatus | "all";

const FILTER_ORDER: FilterValue[] = ["all", ...STUDIO_INQUIRY_STATUSES];

export function LeadStatusFilter({
  active,
  type,
  counts,
}: {
  active?: StudioInquiryStatus;
  type?: string;
  counts?: Partial<Record<StudioInquiryStatus, number>>;
}) {
  const activeKey: FilterValue = active ?? "all";
  const typeQuery = type ? `&type=${type}` : "";

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_ORDER.map((status) => {
        const isAll = status === "all";
        const label = isAll ? "Alle" : STUDIO_INQUIRY_STATUS_LABELS[status];
        const href = isAll
          ? type
            ? `/studio/app?type=${type}`
            : "/studio/app"
          : `/studio/app?status=${status}${typeQuery}`;
        const isActive = activeKey === status;
        const theme = isAll
          ? {
              filterActive: "bg-gray-900 text-white ring-2 ring-gray-300",
              filterIdle: "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50",
            }
          : LEAD_STATUS_THEMES[status];
        const count = isAll ? undefined : counts?.[status];

        return (
          <Link
            key={status}
            href={href}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isActive ? theme.filterActive : theme.filterIdle
            }`}
          >
            {!isAll ? (
              <span className={`h-1.5 w-1.5 rounded-full ${LEAD_STATUS_THEMES[status].dot}`} aria-hidden />
            ) : null}
            {label}
            {count != null && count > 0 ? (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? "bg-white/20" : "bg-black/5"}`}>
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
