"use client";

import { confirmFreeServiceBookingAction, startGroupCheckoutAction } from "@/app/billing/actions";
import { formatGroupPrice } from "@/lib/monetization/pricing-display";
import {
  generateServiceBookingSlots,
  type ServiceBookingSlot,
} from "@/lib/service-booking/slots";
import { Calendar, Check, CreditCard } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

interface ServiceBookingPanelProps {
  communityId: string;
  communitySlug: string;
  groupId: string;
  groupSlug: string;
  groupTitle: string;
  priceCents: number;
  currency?: string;
  stripePriceId?: string | null;
  isLoggedIn: boolean;
}

export function ServiceBookingPanel({
  communityId,
  communitySlug,
  groupId,
  groupSlug,
  groupTitle,
  priceCents,
  currency,
  stripePriceId,
  isLoggedIn,
}: ServiceBookingPanelProps) {
  const slots = useMemo(() => generateServiceBookingSlots(groupId), [groupId]);
  const [selected, setSelected] = useState<ServiceBookingSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookedFree, setBookedFree] = useState(false);
  const [pending, startTransition] = useTransition();

  const priceLabel = formatGroupPrice(priceCents, currency);
  const isFree = priceCents <= 0;

  if (!isLoggedIn) {
    return (
      <section className="rounded-3xl bg-white p-4 shadow-card text-center">
        <p className="text-sm text-unze-ink-secondary">
          <Link href="/auth/login" className="font-semibold text-unze-green">
            Anmelden
          </Link>
          , um einen Termin zu buchen
          {priceLabel ? ` (${priceLabel})` : ""}.
        </p>
      </section>
    );
  }

  function handleBook() {
    if (!selected) {
      setError("Bitte einen Termin wählen.");
      return;
    }
    setError(null);
    startTransition(async () => {
      if (isFree) {
        const result = await confirmFreeServiceBookingAction({
          communitySlug,
          groupSlug,
          groupTitle,
          slotId: selected.id,
          slotLabel: selected.label,
        });
        if (result?.error) {
          setError(result.error);
          return;
        }
        setBookedFree(true);
        return;
      }

      const result = await startGroupCheckoutAction({
        communityId,
        communitySlug,
        groupId,
        groupSlug,
        groupTitle,
        priceCents,
        stripePriceId,
        bookingSlotId: selected.id,
        bookingSlotLabel: selected.label,
      });
      if (result?.error) setError(result.error);
    });
  }

  if (bookedFree) {
    return (
      <section className="rounded-3xl border border-unze-green/30 bg-unze-green-muted/20 p-4 shadow-card">
        <div className="flex items-center gap-2 text-unze-green-dark">
          <Check className="h-5 w-5" aria-hidden />
          <p className="text-sm font-semibold">Termin angefragt</p>
        </div>
        <p className="mt-2 text-sm text-unze-ink-secondary">
          {selected?.label} — der Anbieter bestätigt deinen kostenlosen Slot.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <header className="mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-unze-green" aria-hidden />
        <div>
          <h2 className="text-sm font-semibold text-unze-ink">Termin buchen</h2>
          <p className="text-xs text-unze-ink-secondary">
            Wähle einen freien Slot — danach {isFree ? "Bestätigung" : "sichere Zahlung via Stripe"}
          </p>
        </div>
      </header>

      {priceLabel && (
        <p className="mb-3 text-lg font-bold text-unze-ink">{priceLabel}</p>
      )}

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((slot) => {
          const active = selected?.id === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => setSelected(slot)}
              className={`rounded-xl border px-2 py-2.5 text-left text-[11px] font-medium transition-colors ${
                active
                  ? "border-unze-green bg-unze-green-muted text-unze-green-dark"
                  : "border-unze-border bg-unze-surface-muted/40 text-unze-ink-secondary hover:border-unze-green/40"
              }`}
            >
              {slot.label}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={pending || !selected}
        onClick={handleBook}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        <CreditCard className="h-4 w-4" aria-hidden />
        {pending
          ? "Weiterleitung…"
          : isFree
            ? "Kostenlos reservieren"
            : priceLabel
              ? `${priceLabel} · Jetzt buchen`
              : "Jetzt buchen"}
      </button>
    </section>
  );
}
