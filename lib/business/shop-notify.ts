/**
 * Shop-Benachrichtigungen — Business-Kontext only (kein Connect).
 */

import {
  buildShopOrderAdminEmail,
  buildShopOrderCustomerEmail,
  buildShopOutboundEmail,
} from "@/lib/business/shop-email";
import type { StudioShopOrder } from "@/lib/studio/shop-order-types";

function getNotifyEmail(): string {
  return (
    process.env.BUSINESS_NOTIFY_EMAIL?.trim() ||
    process.env.BUSINESS_ADMIN_EMAIL?.trim() ||
    "support@unze.app"
  );
}

function getFromAddress(): string {
  return process.env.BUSINESS_EMAIL_FROM?.trim() || "UNZE Business <noreply@unze.app>";
}

export async function sendBusinessEmail(
  to: string,
  subject: string,
  text: string,
): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [to],
      subject,
      text,
      reply_to: getNotifyEmail(),
    }),
  });

  if (!res.ok) {
    console.error("[shop/notify] Resend failed:", await res.text());
    return false;
  }
  return true;
}

export async function notifyShopOrderPaid(order: StudioShopOrder): Promise<void> {
  const customerMail = buildShopOrderCustomerEmail(order);
  const adminMail = buildShopOrderAdminEmail(order);

  const customerSent = await sendBusinessEmail(
    order.customerEmail,
    customerMail.subject,
    customerMail.text,
  );
  const adminSent = await sendBusinessEmail(getNotifyEmail(), adminMail.subject, adminMail.text);

  if (!customerSent || !adminSent) {
    console.info("[shop/notify] E-Mail fallback log:", {
      referenceId: order.referenceId,
      customerSent,
      adminSent,
    });
  }
}

export async function sendShopOrderMessageToCustomer(input: {
  order: StudioShopOrder;
  subject: string;
  body: string;
}): Promise<boolean> {
  const email = buildShopOutboundEmail(input);
  return sendBusinessEmail(input.order.customerEmail, email.subject, email.text);
}
