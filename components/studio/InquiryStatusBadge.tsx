import { STUDIO_INQUIRY_STATUS_LABELS } from "@/lib/studio/constants";
import type { StudioInquiryStatus } from "@/lib/studio/types";

const STATUS_STYLES: Record<StudioInquiryStatus, string> = {
  neue_anfrage: "bg-blue-50 text-blue-700 ring-blue-600/20",
  zahlung_ausstehend: "bg-orange-50 text-orange-800 ring-orange-600/20",
  kontaktiert: "bg-amber-50 text-amber-800 ring-amber-600/20",
  angebot: "bg-violet-50 text-violet-700 ring-violet-600/20",
  abgeschlossen: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  abgelehnt: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

interface InquiryStatusBadgeProps {
  status: StudioInquiryStatus;
}

export function InquiryStatusBadge({ status }: InquiryStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {STUDIO_INQUIRY_STATUS_LABELS[status] ?? status}
    </span>
  );
}
