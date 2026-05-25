"use client";

import { submitCommunityVerificationAction } from "@/app/dashboard/verification-actions";
import { VERIFICATION_DOCUMENT_LABELS } from "@/lib/verification/constants";
import { VERIFICATION_STATUS_LABELS } from "@/lib/verification/constants";
import type { VerificationRequest } from "@/types/verification";
import { BadgeCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { VerificationStatusBadge } from "./VerificationStatusBadge";

interface CommunityVerificationPanelProps {
  slug: string;
  communityId: string;
  isVerified: boolean;
  requests: VerificationRequest[];
}

export function CommunityVerificationPanel({
  slug,
  communityId,
  isVerified,
  requests,
}: CommunityVerificationPanelProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const pendingRequest = requests.find((r) =>
    ["pending", "reviewing"].includes(r.status),
  );

  if (isVerified) {
    return (
      <div className="rounded-2xl border border-unze-green/30 bg-unze-green-muted/20 p-4 text-center">
        <VerificationStatusBadge type="community" className="mb-2" />
        <p className="text-sm text-unze-ink-secondary">Diese Community ist verifiziert.</p>
      </div>
    );
  }

  if (pendingRequest) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">
          Antrag in Prüfung
        </p>
        <p className="text-xs text-amber-800">
          Status: {VERIFICATION_STATUS_LABELS[pendingRequest.status]}
        </p>
      </div>
    );
  }

  return (
    <form
      encType="multipart/form-data"
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          const result = await submitCommunityVerificationAction(
            slug,
            communityId,
            formData,
          );
          if (result.error) setError(result.error);
          else setSuccess(true);
        });
      }}
      className="space-y-4 rounded-2xl border border-unze-border bg-white p-4"
    >
      <p className="text-sm text-unze-ink-secondary">
        Verifizierte Communities erhalten ein Trust-Badge und bessere Sichtbarkeit
        (Discover vorbereitet).
      </p>

      <div>
        <label className="mb-1 block text-xs font-medium">
          {VERIFICATION_DOCUMENT_LABELS.community_ownership} *
        </label>
        <input
          type="file"
          name="doc_community_ownership"
          required
          accept="image/jpeg,image/png,application/pdf"
          className="w-full text-xs file:rounded-lg file:border-0 file:bg-unze-green-muted file:px-3 file:py-2"
        />
        <p className="mt-1 text-[10px] text-unze-ink-muted">
          Nachweis der Community-Inhaberschaft · privat gespeichert
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">Anmerkungen</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="z.B. offizielle Plattform, Markenrechte…"
          className="w-full rounded-xl border border-unze-border px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="flex items-center gap-2 text-sm text-unze-green-dark">
          <BadgeCheck className="h-4 w-4" aria-hidden />
          Antrag eingereicht
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-unze-green py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Senden…" : "Community verifizieren lassen"}
      </button>
    </form>
  );
}
