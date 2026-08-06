import { getAppUrl } from "@/lib/env";
import {
  getAnalysisTier,
  type AnalysisTierId,
} from "@/lib/constants/business-analysis-tiers";
import { isStripeConfigured } from "@/lib/stripe/config";
import { getStripeClient } from "@/lib/stripe/server";

export async function createAnalysisCheckout(input: {
  inquiryId: string;
  referenceId: string;
  tier: AnalysisTierId;
  customerEmail: string;
  companyName?: string | null;
}): Promise<{ url: string | null; error: string | null }> {
  if (!isStripeConfigured()) {
    return { url: null, error: "Online-Zahlung ist derzeit nicht verfügbar" };
  }

  const tier = getAnalysisTier(input.tier);
  if (!tier?.requiresPayment || tier.priceCents <= 0) {
    return { url: null, error: "Diese Stufe erfordert keine Zahlung" };
  }

  const stripe = await getStripeClient();
  if (!stripe) return { url: null, error: "Stripe nicht konfiguriert" };

  const base = getAppUrl();
  const productName = `UNZE Business — ${tier.name}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: tier.priceCents,
          product_data: {
            name: productName,
            description: tier.subtitle,
          },
        },
      },
    ],
    success_url: `${base}/business/analyse/erfolg?ref=${encodeURIComponent(input.referenceId)}&paid=1`,
    cancel_url: `${base}/business/analyse/abgebrochen?ref=${encodeURIComponent(input.referenceId)}`,
    metadata: {
      unze_checkout_type: "analysis_business",
      unze_analysis_tier: tier.id,
      unze_inquiry_id: input.inquiryId,
      unze_reference_id: input.referenceId,
      unze_company: input.companyName?.trim() ?? "",
    },
  });

  if (!session.url) {
    return { url: null, error: "Checkout konnte nicht erstellt werden" };
  }

  return { url: session.url, error: null };
}
