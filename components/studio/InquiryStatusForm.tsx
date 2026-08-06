import {
  STUDIO_INQUIRY_STATUSES,
  STUDIO_INQUIRY_STATUS_LABELS,
} from "@/lib/studio/constants";
import { updateInquiryStatusAction } from "@/lib/studio/actions";
import type { StudioInquiryStatus } from "@/lib/studio/types";

interface InquiryStatusFormProps {
  inquiryId: string;
  currentStatus: StudioInquiryStatus;
}

export function InquiryStatusForm({ inquiryId, currentStatus }: InquiryStatusFormProps) {
  return (
    <form action={updateInquiryStatusAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={inquiryId} />
      <div>
        <label htmlFor="status" className="block text-xs font-medium text-gray-500">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {STUDIO_INQUIRY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STUDIO_INQUIRY_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        style={{ backgroundColor: "#1DB872" }}
      >
        Speichern
      </button>
    </form>
  );
}
