"use client";

import { submitReportAction } from "@/app/report/actions";
import type { ReportTargetType } from "@/types/governance";
import { Flag } from "lucide-react";
import { useState, useTransition } from "react";

const REPORT_REASONS = [
  "Spam",
  "Belästigung",
  "Betrug / Scam",
  "Unangemessene Inhalte",
  "Impersonation",
  "Sonstiges",
];

interface ReportDialogProps {
  targetType: ReportTargetType;
  targetId: string;
  communityId?: string | null;
  label?: string;
  returnPath?: string;
}

export function ReportDialog({
  targetType,
  targetId,
  communityId,
  label = "Melden",
  returnPath,
}: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      setError(null);
      const result = await submitReportAction({
        targetType,
        targetId,
        communityId,
        reason,
        details: details.trim() || undefined,
        returnPath,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setDetails("");
      }, 1500);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-unze-border px-3 py-2 text-xs font-medium text-unze-ink-muted transition hover:bg-unze-surface-muted"
      >
        <Flag className="h-3.5 w-3.5" aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl"
        role="dialog"
        aria-labelledby="report-title"
      >
        <h2 id="report-title" className="text-lg font-semibold text-unze-ink">
          Inhalt melden
        </h2>
        <p className="mt-1 text-sm text-unze-ink-secondary">
          Meldungen werden von Moderatoren geprüft.
        </p>

        {success ? (
          <p className="mt-4 rounded-xl bg-unze-green-muted px-4 py-3 text-sm font-medium text-unze-green-dark">
            Meldung eingereicht — danke!
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-unze-ink-muted">
                Grund
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-unze-border px-3 py-2 text-sm"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-unze-ink-muted">
                Details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Weitere Informationen…"
                className="w-full rounded-xl border border-unze-border px-3 py-2 text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-unze-border py-2.5 text-sm font-medium"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={pending}
                className="flex-1 rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Senden…" : "Melden"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
