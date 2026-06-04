"use client";

import { savePremiumTransitionPlanAction } from "@/app/dashboard/monetization-actions";
import { cn } from "@/lib/utils/cn";
import { CalendarClock, Bell, Shield } from "lucide-react";
import { useActionState } from "react";

const inputClass =
  "mt-1 w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

interface PremiumTransitionPanelProps {
  slug: string;
  isCreator: boolean;
  scheduledAt?: string | null;
  notifyMembers?: boolean;
}

export function PremiumTransitionPanel({
  slug,
  isCreator,
  scheduledAt,
  notifyMembers = true,
}: PremiumTransitionPanelProps) {
  const bound = savePremiumTransitionPlanAction.bind(null, slug);
  const [state, action, pending] = useActionState(bound, null);

  const defaultDate = scheduledAt
    ? new Date(scheduledAt).toISOString().slice(0, 10)
    : "";

  return (
    <form action={action} className="rounded-3xl border border-amber-200/80 bg-amber-50/60 p-4 shadow-card space-y-4">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200/80 text-amber-900">
          <CalendarClock className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-unze-ink">Später kostenpflichtig machen</h3>
          <p className="mt-1 text-xs text-unze-ink-secondary leading-relaxed">
            Deine Community bleibt zunächst kostenlos. Du kannst einen Termin planen, ab dem
            eine Mitgliedschaft nötig ist. Niemand wird automatisch belastet.
          </p>
        </div>
      </div>

      <ul className="space-y-2 text-xs text-unze-ink-secondary">
        <li className="flex gap-2">
          <Bell className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
          Mitglieder erhalten eine Benachrichtigung mit Option: bleiben oder verlassen.
        </li>
        <li className="flex gap-2">
          <Shield className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
          Stripe-Abrechnung wird erst bei aktivierter Monetarisierung + Preisen freigeschaltet.
        </li>
      </ul>

      {isCreator ? (
        <>
          <label className="block text-sm text-unze-ink-secondary">
            Geplantes Datum (optional)
            <input
              type="date"
              name="scheduledDate"
              defaultValue={defaultDate}
              className={inputClass}
              min={new Date().toISOString().slice(0, 10)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-unze-ink">
            <input
              type="checkbox"
              name="notifyMembers"
              defaultChecked={notifyMembers}
              className="h-4 w-4 rounded border-unze-border text-unze-green"
            />
            Mitglieder automatisch informieren
          </label>
          {state?.error && (
            <p className="text-xs text-red-700" role="alert">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="text-xs font-medium text-unze-green-dark">{state.message}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className={cn(
              "w-full rounded-xl bg-amber-800 py-2.5 text-sm font-semibold text-white",
              "disabled:opacity-60 active:scale-[0.98]",
            )}
          >
            {pending ? "Speichern…" : "Premium-Planung speichern"}
          </button>
        </>
      ) : (
        <p className="text-xs text-unze-ink-muted">Nur der Community-Creator kann dies ändern.</p>
      )}
    </form>
  );
}
