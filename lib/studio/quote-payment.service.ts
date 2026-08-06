import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/server";
import {
  notifyAdminQuotePaymentReceived,
  notifyCustomerQuoteInstallmentReceived,
  notifyCustomerQuotePaymentReceived,
  notifyCustomerQuoteDepositReceived,
} from "@/lib/studio/quote-notify";
import type { PaymentStep } from "@/lib/studio/payment-plans";
import {
  getStudioQuoteById,
  markQuoteInstallmentStarted,
  recordQuotePayment,
} from "@/lib/studio/quotes";

function parsePaymentStep(value: string | undefined): PaymentStep {
  if (value === "deposit" || value === "final" || value === "installment") return value;
  return "full";
}

export async function handleQuoteCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const quoteId = meta.unze_quote_id;
  if (!quoteId) return null;

  const step = parsePaymentStep(meta.unze_payment_step);
  const amountCents = session.amount_total ?? 0;

  if (step === "installment" && session.mode === "subscription" && session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;

    return markQuoteInstallmentStarted({
      quoteId,
      stripeSessionId: session.id,
      subscriptionId,
    });
  }

  if (session.payment_status !== "paid") return null;

  const quote = await recordQuotePayment({
    quoteId,
    stripeSessionId: session.id,
    amountCents,
    step,
  });

  if (!quote) return null;

  if (step === "deposit") {
    await notifyCustomerQuoteDepositReceived(quote, amountCents);
    await notifyAdminQuotePaymentReceived(quote, "Anzahlung");
    return quote;
  }

  await Promise.all([
    notifyCustomerQuotePaymentReceived(quote),
    notifyAdminQuotePaymentReceived(quote, step === "final" ? "Restzahlung" : "Zahlung"),
  ]);

  return quote;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const legacy = invoice as Stripe.Invoice & {
    subscription?: string | { id: string } | null;
  };
  const sub = legacy.subscription;
  if (sub) return typeof sub === "string" ? sub : sub.id;
  const lineSub = invoice.lines?.data?.[0]?.subscription;
  if (!lineSub) return null;
  return typeof lineSub === "string" ? lineSub : lineSub.id;
}

export async function handleQuoteInstallmentInvoicePaid(invoice: Stripe.Invoice) {
  const subId = invoiceSubscriptionId(invoice);

  if (!subId || !invoice.amount_paid) return null;

  const stripe = await getStripeClient();
  if (!stripe) return null;

  const subscription = await stripe.subscriptions.retrieve(subId);
  const quoteId = subscription.metadata?.unze_quote_id;
  if (!quoteId) return null;

  const quote = await getStudioQuoteById(quoteId);
  if (!quote) return null;

  if (quote.paymentPhase === "completed") {
    await stripe.subscriptions.cancel(subId);
    return quote;
  }

  const updated = await recordQuotePayment({
    quoteId,
    stripeSessionId: invoice.id,
    amountCents: invoice.amount_paid,
    step: "installment",
  });

  if (!updated) return null;

  await notifyCustomerQuoteInstallmentReceived(
    updated,
    updated.installmentsPaid,
    invoice.amount_paid,
  );

  if (
    updated.installmentCount !== null &&
    updated.installmentsPaid >= updated.installmentCount
  ) {
    await stripe.subscriptions.cancel(subId);
    await notifyAdminQuotePaymentReceived(updated, "Ratenzahlung abgeschlossen");
    await notifyCustomerQuotePaymentReceived(updated);
  }

  return updated;
}
