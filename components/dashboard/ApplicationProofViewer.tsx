"use client";

import { loadApplicationProofsAction } from "@/app/dashboard/proof-actions";
import type { ApplicationProofFile } from "@/types/storage";
import { FileText, Image as ImageIcon, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";

const PROOF_LABELS: Record<string, string> = {
  image: "Bild",
  document: "Dokument",
  age: "Altersnachweis",
  identity: "Identität",
  creator: "Creator",
  community: "Community",
  generic: "Nachweis",
};

interface ApplicationProofViewerProps {
  slug: string;
  applicationId: string;
  applicantUserId: string;
  defaultOpen?: boolean;
}

export function ApplicationProofViewer({
  slug,
  applicationId,
  applicantUserId,
  defaultOpen = false,
}: ApplicationProofViewerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [proofs, setProofs] = useState<ApplicationProofFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || proofs.length > 0) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    loadApplicationProofsAction(slug, applicationId, applicantUserId).then(
      (result) => {
        if (cancelled) return;
        if (result.error) setError(result.error);
        setProofs(result.proofs);
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [open, slug, applicationId, applicantUserId, proofs.length]);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-unze-surface-muted px-2.5 py-1.5 text-[11px] font-semibold text-unze-ink-secondary"
      >
        <Shield className="h-3 w-3 text-unze-green" aria-hidden />
        {open ? "Nachweise ausblenden" : "Nachweise anzeigen"}
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-xl border border-unze-border bg-unze-surface-muted/20 p-3">
          {loading && (
            <p className="flex items-center gap-2 text-xs text-unze-ink-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Lade private Nachweise…
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}
          {!loading && proofs.length === 0 && !error && (
            <p className="text-xs text-unze-ink-muted">Keine Nachweise hochgeladen.</p>
          )}
          {proofs.map((proof) => (
            <ProofItem key={proof.id} proof={proof} />
          ))}
          <p className="text-[10px] text-unze-ink-muted">
            Private Dateien — Signed URLs, nicht öffentlich.
          </p>
        </div>
      )}
    </div>
  );
}

function ProofItem({ proof }: { proof: ApplicationProofFile }) {
  const isImage =
    proof.mimeType?.startsWith("image/") || proof.proofCategory === "image";
  const label = PROOF_LABELS[proof.proofCategory] ?? proof.proofCategory;

  return (
    <div className="flex items-start gap-2 rounded-lg bg-white p-2">
      {isImage ? (
        <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-unze-green" aria-hidden />
      ) : (
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-unze-ink-muted" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-unze-ink">{proof.fileName}</p>
        <p className="text-[10px] text-unze-ink-muted">
          {label}
          {proof.fileSizeBytes
            ? ` · ${Math.round(proof.fileSizeBytes / 1024)} KB`
            : ""}
        </p>
        {proof.signedUrl ? (
          isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proof.signedUrl}
              alt={proof.fileName}
              className="mt-2 max-h-40 w-full rounded-lg object-contain"
            />
          ) : (
            <a
              href={proof.signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[11px] font-medium text-unze-green underline-offset-2 hover:underline"
            >
              Sicher ansehen (Signed URL)
            </a>
          )
        ) : (
          <p className="mt-1 text-[10px] text-amber-700">
            Nur Metadaten — Storage-Upload ausstehend
          </p>
        )}
      </div>
    </div>
  );
}
