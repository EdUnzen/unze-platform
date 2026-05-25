"use client";

import {
  loadVerificationDocumentsAction,
  reviewVerificationAction,
} from "@/app/dashboard/verification-actions";
import {
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_TYPE_LABELS,
} from "@/lib/verification/constants";
import type { VerificationDocument, VerificationRequest } from "@/types/verification";
import { Check, Eye, X } from "lucide-react";
import { useState, useTransition } from "react";

interface VerificationReviewPanelProps {
  requests: VerificationRequest[];
  slug?: string;
}

export function VerificationReviewPanel({
  requests,
  slug,
}: VerificationReviewPanelProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [docs, setDocs] = useState<VerificationDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const pendingRequests = requests.filter((r) =>
    ["pending", "reviewing"].includes(r.status),
  );

  async function loadDocs(requestId: string) {
    if (expandedId === requestId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(requestId);
    setLoadingDocs(true);
    const result = await loadVerificationDocumentsAction(requestId, slug);
    setDocs(result.documents);
    setLoadingDocs(false);
  }

  function handleReview(requestId: string, action: "approve" | "reject") {
    startTransition(async () => {
      setError(null);
      const reason =
        action === "reject"
          ? prompt("Ablehnungsgrund (optional)") ?? undefined
          : undefined;
      const result = await reviewVerificationAction(
        requestId,
        action,
        reason,
        slug,
      );
      if (result.error) setError(result.error);
    });
  }

  if (pendingRequests.length === 0) {
    return (
      <p className="text-sm text-unze-ink-muted">Keine offenen Verifizierungsanträge.</p>
    );
  }

  return (
    <div className="space-y-3">
      {pendingRequests.map((req) => (
        <div
          key={req.id}
          className="rounded-2xl border border-unze-border bg-white p-4"
        >
          <div>
            <p className="text-sm font-semibold text-unze-ink">
              {VERIFICATION_TYPE_LABELS[req.verificationType]}
            </p>
            <p className="text-xs text-unze-ink-muted">
              {req.submitterDisplayName ?? "Nutzer"} ·{" "}
              {VERIFICATION_STATUS_LABELS[req.status]} ·{" "}
              {new Date(req.createdAt).toLocaleDateString("de-DE")}
            </p>
            {req.businessName && (
              <p className="text-xs text-unze-ink-secondary">{req.businessName}</p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadDocs(req.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-unze-border px-2.5 py-1.5 text-[11px] font-medium"
            >
              <Eye className="h-3 w-3" aria-hidden />
              Dokumente
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => handleReview(req.id, "approve")}
              className="inline-flex items-center gap-1 rounded-lg bg-unze-green px-2.5 py-1.5 text-[11px] font-semibold text-white"
            >
              <Check className="h-3 w-3" aria-hidden />
              Freigeben
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => handleReview(req.id, "reject")}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-700"
            >
              <X className="h-3 w-3" aria-hidden />
              Ablehnen
            </button>
          </div>

          {expandedId === req.id && (
            <div className="mt-3 space-y-2 rounded-xl bg-unze-surface-muted/30 p-3">
              {loadingDocs ? (
                <p className="text-xs text-unze-ink-muted">Lade Dokumente…</p>
              ) : docs.length === 0 ? (
                <p className="text-xs text-unze-ink-muted">Keine Dokumente.</p>
              ) : (
                docs.map((doc) => (
                  <div key={doc.id} className="text-xs">
                    <p className="font-medium">{doc.fileName}</p>
                    {doc.signedUrl ? (
                      <a
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-unze-green underline-offset-2 hover:underline"
                      >
                        Sicher ansehen (Signed URL · protokolliert)
                      </a>
                    ) : (
                      <p className="text-amber-700">URL nicht verfügbar</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
