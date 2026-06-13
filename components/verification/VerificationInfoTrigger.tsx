"use client";

import { cn } from "@/lib/utils/cn";
import { BadgeCheck, X } from "lucide-react";
import { useState } from "react";

export type VerificationKind = "profile" | "creator" | "business" | "community";

const TYPE_LABELS: Record<VerificationKind, string> = {
  profile: "Profil verifiziert",
  creator: "Creator verifiziert",
  business: "Gewerbe verifiziert",
  community: "Community verifiziert",
};

interface VerificationInfoTriggerProps {
  kind: VerificationKind;
  verifiedAt?: string | null;
  className?: string;
  iconClassName?: string;
  /** Pill-Variante statt nur Icon */
  variant?: "icon" | "pill";
}

function formatVerifiedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function VerificationInfoTrigger({
  kind,
  verifiedAt,
  className,
  iconClassName,
  variant = "icon",
}: VerificationInfoTriggerProps) {
  const [open, setOpen] = useState(false);
  const label = TYPE_LABELS[kind];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          variant === "pill"
            ? "inline-flex items-center gap-1 rounded-full bg-unze-green-muted px-2 py-0.5 text-[10px] font-semibold text-unze-green-dark"
            : "inline-flex shrink-0 rounded-full p-0.5 text-unze-green transition hover:bg-unze-green-muted/50",
          className,
        )}
        aria-label={`${label} — Details anzeigen`}
      >
        <BadgeCheck
          className={cn(variant === "pill" ? "h-3 w-3" : "h-4 w-4", iconClassName)}
          aria-hidden
        />
        {variant === "pill" && label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl"
            role="dialog"
            aria-labelledby="verification-info-title"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-unze-green-muted">
                  <BadgeCheck className="h-5 w-5 text-unze-green" aria-hidden />
                </span>
                <div>
                  <h2 id="verification-info-title" className="text-base font-semibold text-unze-ink">
                    UNZE-Verifizierung
                  </h2>
                  <p className="text-xs text-unze-ink-secondary">Geprüft durch UNZE</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-unze-ink-muted hover:bg-unze-surface-muted"
                aria-label="Schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-unze-ink-secondary">Typ</dt>
                <dd className="text-right font-medium text-unze-ink">{label}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-unze-ink-secondary">Status</dt>
                <dd className="font-medium text-unze-green-dark">Verifiziert</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-unze-ink-secondary">Verifiziert am</dt>
                <dd className="text-right font-medium text-unze-ink">
                  {verifiedAt ? formatVerifiedDate(verifiedAt) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-unze-ink-secondary">Geprüft durch</dt>
                <dd className="text-right font-medium text-unze-ink">UNZE</dd>
              </div>
            </dl>

            <p className="mt-4 rounded-2xl bg-unze-surface-muted/60 px-3 py-2.5 text-xs leading-relaxed text-unze-ink-secondary">
              Verifizierungen werden von UNZE manuell geprüft. Sie bestätigen Identität oder
              Community-Qualität — nicht automatisch bei Registrierung.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
