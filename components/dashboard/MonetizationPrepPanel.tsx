"use client";

import { saveCommunityPricingAction } from "@/app/billing/actions";
import { toggleMonetizationPrepAction } from "@/app/dashboard/actions";
import { CommercialInfoDialog } from "@/components/referral/CommercialInfoDialog";
import {
  PLATFORM_FEE_LABEL,
  REFERRER_SHARE_LABEL,
} from "@/lib/constants/revenue";
import { cn } from "@/lib/utils/cn";
import { CreditCard, Link2, Lock, Wallet } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";

const inputClass =
  "mt-1 w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

interface MonetizationPrepPanelProps {
  slug: string;
  monetizationEnabled: boolean;
  isCreator: boolean;
  pricing?: { monthly: string; semiannual: string; yearly: string };
}

export function MonetizationPrepPanel({
  slug,
  monetizationEnabled: initialEnabled,
  isCreator,
  pricing = { monthly: "", semiannual: "", yearly: "" },
}: MonetizationPrepPanelProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const boundPricing = saveCommunityPricingAction.bind(null, slug);
  const [pricingState, pricingAction, pricingPending] = useActionState(boundPricing, null);

  const toggle = () => {
    if (!isCreator) return;
    startTransition(async () => {
      const next = !enabled;
      const result = await toggleMonetizationPrepAction(slug, next);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setEnabled(next);
      setMessage(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-unze-green-muted to-white p-5 shadow-card">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-unze-green text-white">
          <Wallet className="h-6 w-6" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-unze-ink">Stripe & Preise</h3>
        <p className="mt-1 text-sm text-unze-ink-secondary">
          Abos (monatlich, halbjährlich, jährlich) und Einmalzahlungen über Stripe.
          Kündigungen laufen über das Stripe-Kundenportal.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/dashboard/referrals"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-1.5 text-xs font-semibold text-unze-green-dark"
          >
            <Link2 className="h-3.5 w-3.5" />
            Stripe Connect
          </Link>
          <CommercialInfoDialog triggerClassName="inline-flex items-center gap-1 rounded-xl bg-white/60 px-3 py-1.5 text-xs font-medium text-unze-ink-muted" />
        </div>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-unze-ink">Monetarisierung aktiv</p>
            <p className="text-xs text-unze-ink-muted">Ermöglicht kostenpflichtige Abos</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={!isCreator || pending}
            onClick={toggle}
            className={cn(
              "relative h-8 w-14 shrink-0 rounded-full transition-colors",
              enabled ? "bg-unze-green" : "bg-unze-border",
              !isCreator && "opacity-50",
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform",
                enabled ? "left-7" : "left-1",
              )}
            />
          </button>
        </div>
        {message && <p className="mt-2 text-xs text-red-600">{message}</p>}
      </div>

      {isCreator && (
        <form action={pricingAction} className="rounded-3xl bg-white p-4 shadow-card space-y-3">
          <h3 className="text-sm font-semibold text-unze-ink">Abo-Preise (EUR)</h3>
          <label className="block text-sm text-unze-ink-secondary">
            Monatlich
            <input name="priceMonthly" defaultValue={pricing.monthly} className={inputClass} placeholder="9.99" />
          </label>
          <label className="block text-sm text-unze-ink-secondary">
            Halbjährlich
            <input name="priceSemiannual" defaultValue={pricing.semiannual} className={inputClass} placeholder="49.99" />
          </label>
          <label className="block text-sm text-unze-ink-secondary">
            Jährlich
            <input name="priceYearly" defaultValue={pricing.yearly} className={inputClass} placeholder="89.99" />
          </label>
          {pricingState?.error && <p className="text-xs text-red-600">{pricingState.error}</p>}
          {pricingState?.success && (
            <p className="text-xs text-unze-green">Preise gespeichert und mit Stripe synchronisiert.</p>
          )}
          <button
            type="submit"
            disabled={pricingPending}
            className="w-full rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pricingPending ? "…" : "Preise speichern"}
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {[
          { icon: CreditCard, title: "Stripe Abos", desc: "Monatlich · Halbjährlich · Jährlich" },
          { icon: Lock, title: "Revenue Share", desc: `${PLATFORM_FEE_LABEL}, ${REFERRER_SHARE_LABEL}` },
        ].map(({ icon: Icon, title, desc }) => (
          <li
            key={title}
            className="flex gap-3 rounded-2xl border border-unze-border bg-unze-surface-muted/30 p-4"
          >
            <Icon className="h-5 w-5 shrink-0 text-unze-ink-muted" aria-hidden />
            <div>
              <p className="text-sm font-medium text-unze-ink">{title}</p>
              <p className="text-xs text-unze-ink-muted">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
