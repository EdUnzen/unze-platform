"use server";

import { revalidatePath } from "next/cache";
import { sendShopOrderMessageToCustomer } from "@/lib/business/shop-notify";
import {
  appendOrderMessage,
  getShopOrderById,
  updateShopOrderStatus,
} from "@/lib/studio/shop-orders";
import type { ShopOrderStatus } from "@/lib/studio/shop-order-types";
import { getStudioSession } from "@/lib/studio/auth";

export async function updateShopOrderStatusAction(orderId: string, status: ShopOrderStatus) {
  const user = await getStudioSession();
  if (!user) return { error: "Nicht angemeldet" };

  const ok = await updateShopOrderStatus(orderId, status);
  if (!ok) return { error: "Status konnte nicht gespeichert werden" };

  await appendOrderMessage({
    orderId,
    direction: "system",
    subject: "Status geändert",
    body: `Status auf „${status}“ gesetzt.`,
  });

  revalidatePath(`/studio/app/auftraege/${orderId}`);
  revalidatePath("/studio/app/auftraege");
  return { ok: true };
}

export async function sendShopOrderMessageAction(input: {
  orderId: string;
  subject: string;
  body: string;
}) {
  const user = await getStudioSession();
  if (!user) return { error: "Nicht angemeldet" };

  const order = await getShopOrderById(input.orderId);
  if (!order) return { error: "Auftrag nicht gefunden" };

  const subject = input.subject.trim() || `Nachricht zu ${order.productName}`;
  const body = input.body.trim();
  if (!body) return { error: "Nachricht erforderlich" };

  const sent = await sendShopOrderMessageToCustomer({ order, subject, body });

  await appendOrderMessage({
    orderId: order.id,
    direction: "outbound",
    subject,
    body,
    fromEmail: process.env.BUSINESS_EMAIL_FROM ?? "support@unze.app",
    toEmail: order.customerEmail,
    createdByStudioUserId: user.id,
  });

  revalidatePath(`/studio/app/auftraege/${order.id}`);

  if (!sent) {
    return { ok: true, warning: "Nachricht gespeichert — E-Mail konnte nicht versendet werden (Resend prüfen)" };
  }

  return { ok: true };
}
