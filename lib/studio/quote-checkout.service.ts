import { getAppUrl } from "@/lib/env";
import { formatEuroCents } from "@/lib/business/pricing-utils";
import { isStripeConfigured } from "@/lib/stripe/config";
import { getStripeClient } from "@/lib/stripe/server";
import {
  calculateInstallmentAmount,
  calculateSplitAmounts,
  getNextPaymentStep,
  getPaymentStepLabel,
  PAYMENT_PLANS,
  type PaymentStep,
} from "@/lib/studio/payment-plans";
import type { StudioQuote } from "@/lib/studio/quote-types";
import { markQuotePaymentPending } from "@/lib/studio/quotes";

function checkoutMetadata(quote: StudioQuote, step: PaymentStep, amountCents: number) {
  return {
    unze_checkout_type: "quote_business",
    unze_quote_id: quote.id,
    unze_reference_id: quote.referenceId,
    unze_payment_step: step,
    unze_company: quote.company?.trim() ?? "",
    unze_amount_label: formatEuroCents(amountCents),
    unze_payment_plan: quote.paymentPlan,
  };
}

export async function createQuoteCheckout(
  quote: StudioQuote,
): Promise<{ url: string | null; error: string | null; step?: PaymentStep }> {
  if (!isStripeConfigured()) {
    return { url: null, error: "Stripe ist nicht konfiguriert" };
  }

  if (quote.paymentPhase === "completed" || quote.paymentStatus === "paid") {
    return { url: null, error: "Angebot ist bereits vollständig bezahlt" };
  }

  const step = getNextPaymentStep(quote.paymentPlan, quote.paymentPhase);
  if (!step) {
    return { url: null, error: "Kein offener Zahlungsschritt" };
  }

  const stripe = await getStripeClient();
  if (!stripe) return { url: null, error: "Stripe nicht konfiguriert" };

  const base = getAppUrl();
  const productBase = quote.title ?? `UNZE Angebot ${quote.referenceId}`;

  if (step === "installment") {
    const plan = PAYMENT_PLANS[quote.paymentPlan];
    const installmentCount = plan.installmentCount;
    const monthlyCents = calculateInstallmentAmount(quote.chargeTotalCents, installmentCount);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: quote.customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: monthlyCents,
            recurring: { interval: "month" },
            product_data: {
              name: `${productBase} — ${installmentCount} Raten`,
              description: `Gesamt ${formatEuroCents(quote.chargeTotalCents)} inkl. ${plan.surchargePercent} % Ratenaufschlag`,
            },
          },
        },
      ],
      success_url: `${base}/business/angebot/erfolg?ref=${encodeURIComponent(quote.referenceId)}&plan=installment`,
      cancel_url: `${base}/business/angebot/abgebrochen?ref=${encodeURIComponent(quote.referenceId)}`,
      metadata: checkoutMetadata(quote, step, monthlyCents),
      subscription_data: {
        metadata: {
          unze_quote_id: quote.id,
          unze_installment_count: String(installmentCount),
          unze_checkout_type: "quote_business",
        },
      },
    });

    if (!session.url) return { url: null, error: "Checkout konnte nicht erstellt werden" };
    await markQuotePaymentPending(quote.id, session.id);
    return { url: session.url, step, error: null };
  }

  let amountCents = quote.chargeTotalCents;
  let productName = productBase;

  if (step === "deposit") {
    amountCents = calculateSplitAmounts(quote.chargeTotalCents).depositCents;
    productName = `${productBase} — Anzahlung 50 %`;
  } else if (step === "final") {
    amountCents = calculateSplitAmounts(quote.chargeTotalCents).finalCents;
    productName = `${productBase} — Restzahlung bei Abnahme`;
  }

  if (amountCents <= 0) {
    return { url: null, error: "Zahlungsbetrag ungültig" };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: quote.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: {
            name: productName,
            description: `${getPaymentStepLabel(step)} · ${quote.referenceId}`,
          },
        },
      },
    ],
    success_url: `${base}/business/angebot/erfolg?ref=${encodeURIComponent(quote.referenceId)}&step=${step}`,
    cancel_url: `${base}/business/angebot/abgebrochen?ref=${encodeURIComponent(quote.referenceId)}`,
    metadata: checkoutMetadata(quote, step, amountCents),
  });

  if (!session.url) {
    return { url: null, error: "Checkout konnte nicht erstellt werden" };
  }

  await markQuotePaymentPending(quote.id, session.id);
  return { url: session.url, step, error: null };
}
