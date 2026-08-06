"use client";

import {
  createQuotePaymentLinkAction,
  updateQuotePaymentPlanAction,
} from "@/lib/studio/quote-actions";
import {
  buildQuoteMailtoLink,
  buildWhatsAppShareLink,
} from "@/lib/studio/quote-notify";
import {
  describePaymentPlan,
  getNextPaymentStep,
  getPaymentStepLabel,
  PAYMENT_PLANS,
  type PaymentPlanId,
} from "@/lib/studio/payment-plans";
import { formatEuroCents } from "@/lib/business/pricing-utils";
import type { StudioQuote } from "@/lib/studio/quote-types";
import Link from "next/link";

interface QuotePaymentPanelProps {
  quote: StudioQuote;
  paymentUrl?: string;
}

export function QuotePaymentPanel({ quote, paymentUrl }: QuotePaymentPanelProps) {
  const installmentActive =
    (quote.paymentPlan === "installments_3" || quote.paymentPlan === "installments_6") &&
    Boolean(quote.stripeSubscriptionId) &&
    quote.paymentPhase !== "completed";

  const nextStep = installmentActive
    ? null
    : getNextPaymentStep(quote.paymentPlan, quote.paymentPhase);
  const canChangePlan = quote.amountPaidCents === 0;

  if (quote.paymentPhase === "completed" || quote.paymentStatus === "paid") {
    return (
      <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Vollständig bezahlt ({formatEuroCents(quote.amountPaidCents)}
        {quote.paidAt ? ` · ${new Date(quote.paidAt).toLocaleDateString("de-DE")}` : ""}).
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-4 text-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Zahlungsmodell</p>
        <p className="mt-2 font-medium text-gray-900">
          {describePaymentPlan(quote.paymentPlan, quote.totalCents)}
        </p>
        {quote.amountPaidCents > 0 ? (
          <p className="mt-1 text-gray-600">
            Bereits bezahlt: {formatEuroCents(quote.amountPaidCents)} von{" "}
            {formatEuroCents(quote.chargeTotalCents)}
          </p>
        ) : null}
      </div>

      {canChangePlan ? (
        <form action={updateQuotePaymentPlanAction} className="space-y-2">
          <input type="hidden" name="quoteId" value={quote.id} />
          <label htmlFor="paymentPlan" className="block text-xs font-medium text-gray-500">
            Zahlungsplan wählen
          </label>
          <select
            id="paymentPlan"
            name="paymentPlan"
            defaultValue={quote.paymentPlan}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {(Object.keys(PAYMENT_PLANS) as PaymentPlanId[]).map((id) => (
              <option key={id} value={id}>
                {PAYMENT_PLANS[id].label}
                {PAYMENT_PLANS[id].surchargePercent > 0
                  ? ` (+${PAYMENT_PLANS[id].surchargePercent} %)`
                  : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            {PAYMENT_PLANS[quote.paymentPlan].description}
          </p>
          <button
            type="submit"
            className="text-sm text-emerald-700 underline hover:text-emerald-900"
          >
            Zahlungsplan speichern
          </button>
        </form>
      ) : (
        <p className="text-xs text-amber-700">
          Zahlungsplan kann nach Beginn der Zahlung nicht mehr geändert werden.
        </p>
      )}

      {paymentUrl ? (
        <div className="rounded-lg border border-emerald-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Zahlungslink{nextStep ? ` — ${getPaymentStepLabel(nextStep)}` : ""}
          </p>
          <p className="mt-2 break-all font-mono text-xs text-emerald-800">{paymentUrl}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Link öffnen
            </a>
            <a
              href={buildQuoteMailtoLink(quote, paymentUrl)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700"
            >
              Per E-Mail
            </a>
            <a
              href={buildWhatsAppShareLink(quote, paymentUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700"
            >
              WhatsApp
            </a>
          </div>
        </div>
      ) : null}

      {installmentActive ? (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Ratenzahlung aktiv: {quote.installmentsPaid} von {quote.installmentCount ?? "?"} Raten
          eingegangen ({formatEuroCents(quote.amountPaidCents)} /{" "}
          {formatEuroCents(quote.chargeTotalCents)}).
        </p>
      ) : null}

      {nextStep ? (
        <form action={createQuotePaymentLinkAction}>
          <input type="hidden" name="quoteId" value={quote.id} />
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "#1DB872" }}
          >
            {paymentUrl ? "Neuen Link erstellen" : getPaymentStepLabel(nextStep)} — Stripe-Link
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">Kein offener Zahlungsschritt.</p>
      )}

      {quote.paymentPlan === "split_50_50" && quote.paymentPhase === "deposit_paid" ? (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Anzahlung erhalten. Restzahlungs-Link erstellen, sobald das Projekt abgenommen ist.
        </p>
      ) : null}

      <Link
        href={`/studio/app/angebote/${quote.id}/pdf`}
        target="_blank"
        className="inline-block text-sm text-gray-600 underline"
      >
        PDF-Vorschau / Drucken
      </Link>
    </div>
  );
}
