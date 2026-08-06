import { notifyShopOrderPaid } from "@/lib/business/shop-notify";
import {
  appendOrderMessage,
  createClientFromShopOrder,
  getShopOrderById,
  markShopOrderPaid,
} from "@/lib/studio/shop-orders";
import type Stripe from "stripe";

/**
 * Business-Shop webhook handler — ISOLATION:
 * Keine Connect-Felder (unze_subscriber_id, unze_community_id).
 */
export async function handleShopCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const meta = session.metadata ?? {};
  if (meta.unze_product_line !== "business" || meta.unze_checkout_type !== "shop_business") {
    console.warn("[shop-payment] Ignoriert — falscher checkout_type/product_line");
    return;
  }

  const orderId = meta.unze_shop_order_id;
  if (!orderId || session.payment_status !== "paid") {
    return;
  }

  const existing = await getShopOrderById(orderId);
  if (!existing) {
    console.error("[shop-payment] Auftrag nicht gefunden:", orderId);
    return;
  }

  if (existing.paymentStatus === "paid") {
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  const order = await markShopOrderPaid({
    orderId,
    stripeSessionId: session.id,
    stripeSubscriptionId: subscriptionId,
  });

  if (!order) return;

  await createClientFromShopOrder(order);

  await appendOrderMessage({
    orderId: order.id,
    direction: "system",
    subject: "Zahlung eingegangen",
    body: `Stripe Checkout abgeschlossen. Betrag: ${(session.amount_total ?? order.totalCents) / 100} EUR.`,
    fromEmail: order.customerEmail,
    toEmail: process.env.BUSINESS_NOTIFY_EMAIL ?? "support@unze.app",
  });

  if (order.customerMessage?.trim()) {
    await appendOrderMessage({
      orderId: order.id,
      direction: "inbound",
      subject: "Kundennotiz bei Buchung",
      body: order.customerMessage.trim(),
      fromEmail: order.customerEmail,
    });
  }

  await notifyShopOrderPaid(order);
}
