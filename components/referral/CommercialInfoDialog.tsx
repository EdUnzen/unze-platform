"use client";

import {
  PLATFORM_FEE_LABEL,
  REFERRER_SHARE_LABEL,
  REVENUE_SHARE_SUMMARY,
} from "@/lib/constants/revenue";
import { Info, X } from "lucide-react";
import { useState } from "react";

interface CommercialInfoDialogProps {
  triggerClassName?: string;
}

export function CommercialInfoDialog({ triggerClassName }: CommercialInfoDialogProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "inline-flex items-center gap-1.5 rounded-xl border border-unze-border bg-white px-3 py-2 text-xs font-medium text-unze-ink-muted transition hover:bg-unze-surface-muted"
        }
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
        Gewerbliche Hinweise
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-xl"
        role="dialog"
        aria-labelledby="commercial-info-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="commercial-info-title" className="text-lg font-semibold text-unze-ink">
            Einnahmen & Auszahlungen
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl p-1 text-unze-ink-muted hover:bg-unze-surface-muted"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-unze-ink-secondary">
          <p>
            Wenn du Premium-Gruppen verkaufst oder Revenue Share erhältst, handelst du
            in der Regel gewerblich. UNZE ersetzt keine Steuer- oder Rechtsberatung.
          </p>

          <section>
            <h3 className="mb-1 font-semibold text-unze-ink">Gebührenstruktur</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>{PLATFORM_FEE_LABEL} auf Zahlungen nach Stripe-Gebühren</li>
              <li>{REFERRER_SHARE_LABEL} (optional, kein MLM)</li>
            </ul>
            <p className="mt-2 text-xs">{REVENUE_SHARE_SUMMARY}</p>
          </section>

          <section>
            <h3 className="mb-1 font-semibold text-unze-ink">Stripe & Auszahlung</h3>
            <p>
              Auszahlungen laufen über Stripe Connect. Im Testmodus (Sandbox) werden
              keine echten Gelder abgerechnet. Für Live-Einnahmen ist ein vollständiges
              Stripe-Onboarding erforderlich.
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-semibold text-unze-ink">Deine Verantwortung</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Steuerliche Behandlung deiner Einnahmen</li>
              <li>Gewerbeanmeldung, falls erforderlich</li>
              <li>Korrekte Angaben bei Stripe</li>
              <li>Einhalten geltender Gesetze in deinem Land</li>
            </ul>
          </section>

          <p className="rounded-2xl bg-unze-surface-muted/60 p-3 text-xs">
            Diese Informationen dienen der Transparenz. Bei konkreten steuerlichen oder
            rechtlichen Fragen wende dich an qualifizierte Berater.
          </p>
        </div>
      </div>
    </div>
  );
}
