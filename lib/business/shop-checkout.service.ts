import { getAppUrl } from "@/lib/env";
import {
  getShopProduct,
  isPublicShopSlug,
  SHOP_TAX_RATE,
  type ShopProduct,
} from "@/lib/constants/business-shop-catalog";
import { isStripeConfigured } from "@/lib/stripe/config";
import { getStripeClient } from "@/lib/stripe/server";
import {
  createShopOrder,
  updateShopOrderCheckoutSession,
} from "@/lib/studio/shop-orders";

export class ShopCheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopCheckoutError";
  }
}

export type ShopCheckoutInput = {
  productSlug: string;
  customerName: string;
  customerEmail: string;
  company?: string | null;
  message?: string | null;
  source?: string | null;
};

function validateInput(input: ShopCheckoutInput, product: ShopProduct): void {
  const email = input.customerEmail?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ShopCheckoutError("Gültige E-Mail erforderlich");
  }
  if (!input.customerName?.trim()) {
    throw new ShopCheckoutError("Name erforderlich");
  }
  if (!isPublicShopSlug(product.slug)) {
    throw new ShopCheckoutError("Produkt nicht buchbar");
  }
}

export async function createShopCheckout(
  input: ShopCheckoutInput,
): Promise<{ url: string | null; orderReferenceId: string | null; error: string | null }> {
  const product = getShopProduct(input.productSlug);
  if (!product) {
    return { url: null, orderReferenceId: null, error: "Produkt nicht gefunden" };
  }

  try {
    validateInput(input, product);
  } catch (e) {
    const msg = e instanceof ShopCheckoutError ? e.message : "Ungültige Eingabe";
    return { url: null, orderReferenceId: null, error: msg };
  }

  if (!isStripeConfigured()) {
    return { url: null, orderReferenceId: null, error: "Online-Zahlung derzeit nicht verfügbar" };
  }

  const subtotalCents = product.priceCents;
  const taxCents = Math.round(subtotalCents * SHOP_TAX_RATE);
  const totalCents = subtotalCents + taxCents;

  const order = await createShopOrder({
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    productType: product.type,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    company: input.company,
    customerMessage: input.message,
    subtotalCents,
    taxRate: SHOP_TAX_RATE,
    taxCents,
    totalCents,
    processingTime: product.processingTime,
    source: input.source ?? null,
    metadata: {
      postPurchasePath: product.postPurchasePath ?? null,
      priceNote: product.priceNote ?? null,
    },
  });

  if (!order) {
    return { url: null, orderReferenceId: null, error: "Auftrag konnte nicht angelegt werden" };
  }

  const stripe = await getStripeClient();
  if (!stripe) {
    return { url: null, orderReferenceId: order.referenceId, error: "Stripe nicht konfiguriert" };
  }

  const base = getAppUrl();
  const isSubscription = product.type === "servicepaket" && product.billingInterval === "month";

  const metadata = {
    unze_product_line: "business",
    unze_checkout_type: "shop_business",
    unze_shop_order_id: order.id,
    unze_shop_reference_id: order.referenceId,
    unze_shop_product_slug: product.slug,
  };

  const lineItem = {
    quantity: 1,
    price_data: {
      currency: "eur" as const,
      unit_amount: totalCents,
      product_data: {
        name: `UNZE Business — ${product.name}`,
        description: product.shortDescription,
      },
      ...(isSubscription ? { recurring: { interval: "month" as const } } : {}),
    },
  };

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    customer_email: input.customerEmail.trim().toLowerCase(),
    line_items: [lineItem],
    success_url: `${base}/business/shop/erfolg?ref=${encodeURIComponent(order.referenceId)}`,
    cancel_url: `${base}/business/shop/abgebrochen?ref=${encodeURIComponent(order.referenceId)}`,
    metadata,
    ...(isSubscription
      ? {
          subscription_data: {
            metadata,
          },
        }
      : {}),
  });

  if (!session.url) {
    return { url: null, orderReferenceId: order.referenceId, error: "Checkout fehlgeschlagen" };
  }

  await updateShopOrderCheckoutSession(order.id, session.id);

  return { url: session.url, orderReferenceId: order.referenceId, error: null };
}
