"use client";

import { submitCreatorVerificationAction } from "@/app/dashboard/verification-actions";
import { VERIFICATION_DOCUMENT_LABELS } from "@/lib/verification/constants";
import type { CreatorVerificationProfile } from "@/types/verification";
import { BadgeCheck, Building2, User } from "lucide-react";
import { useState, useTransition } from "react";
import { VerificationStatusBadge } from "./VerificationStatusBadge";

interface CreatorVerificationFormProps {
  status: CreatorVerificationProfile | null;
}

export function CreatorVerificationForm({ status }: CreatorVerificationFormProps) {
  const [mode, setMode] = useState<"creator_identity" | "creator_business">(
    "creator_identity",
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (status?.isVerifiedCreator) {
    return (
      <div className="rounded-2xl border border-unze-green/30 bg-unze-green-muted/20 p-4 text-center">
        <VerificationStatusBadge type="creator" tier={status.tier} className="mb-2" />
        <p className="text-sm text-unze-ink-secondary">
          Du bist als Creator verifiziert
          {status.verifiedAt &&
            ` · seit ${new Date(status.verifiedAt).toLocaleDateString("de-DE")}`}
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
          setSuccess(false);
          formData.set("verificationType", mode);
          const result = await submitCreatorVerificationAction(formData);
          if (result.error) {
            setError(result.error);
            return;
          }
          setSuccess(true);
        });
      }}
      className="space-y-4 rounded-2xl border border-unze-border bg-white p-4"
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("creator_identity")}
          className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium ${
            mode === "creator_identity"
              ? "border-unze-green bg-unze-green-muted text-unze-green-dark"
              : "border-unze-border text-unze-ink-muted"
          }`}
        >
          <User className="h-4 w-4" aria-hidden />
          Identität
        </button>
        <button
          type="button"
          onClick={() => setMode("creator_business")}
          className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium ${
            mode === "creator_business"
              ? "border-unze-green bg-unze-green-muted text-unze-green-dark"
              : "border-unze-border text-unze-ink-muted"
          }`}
        >
          <Building2 className="h-4 w-4" aria-hidden />
          Gewerbe
        </button>
      </div>

      {mode === "creator_business" && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium">Unternehmensname</label>
            <input
              name="businessName"
              required
              className="w-full rounded-xl border border-unze-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Handelsregister / USt-ID</label>
            <input
              name="businessRegistrationId"
              className="w-full rounded-xl border border-unze-border px-3 py-2 text-sm"
            />
          </div>
        </>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium">
          {VERIFICATION_DOCUMENT_LABELS.identity_document} *
        </label>
        <input
          type="file"
          name="doc_identity_document"
          required
          accept="image/jpeg,image/png,image/webp,application/pdf"
          capture="environment"
          className="w-full text-xs file:rounded-lg file:border-0 file:bg-unze-green-muted file:px-3 file:py-2"
        />
        <p className="mt-1 text-[10px] text-unze-ink-muted">Privat gespeichert · max. 15 MB</p>
      </div>

      {mode === "creator_business" && (
        <div>
          <label className="mb-1 block text-xs font-medium">
            {VERIFICATION_DOCUMENT_LABELS.business_registration} *
          </label>
          <input
            type="file"
            name="doc_business_registration"
            required
            accept="application/pdf,image/jpeg,image/png"
            className="w-full text-xs file:rounded-lg file:border-0 file:bg-unze-green-muted file:px-3 file:py-2"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium">
          {VERIFICATION_DOCUMENT_LABELS.selfie} (optional)
        </label>
        <input
          type="file"
          name="doc_selfie"
          accept="image/jpeg,image/png,image/webp"
          capture="user"
          className="w-full text-xs file:rounded-lg file:border-0 file:bg-unze-green-muted file:px-3 file:py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">Anmerkungen (optional)</label>
        <textarea
          name="notes"
          rows={2}
          className="w-full rounded-xl border border-unze-border px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="flex items-center gap-2 text-sm text-unze-green-dark">
          <BadgeCheck className="h-4 w-4" aria-hidden />
          Antrag eingereicht — du wirst benachrichtigt.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-unze-green py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Wird eingereicht…" : "Verifizierung beantragen"}
      </button>
    </form>
  );
}
