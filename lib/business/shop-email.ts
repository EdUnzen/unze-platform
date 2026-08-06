import { getAppUrl } from "@/lib/env";
import { shopSlugToAnalysisTier } from "@/lib/business/analysis-shop";
import { STUDIO_COMPANY_PROFILE } from "@/lib/studio/company-profile";
import { formatEuroCents } from "@/lib/business/pricing-utils";
import type { StudioShopOrder } from "@/lib/studio/shop-order-types";

export function buildShopOrderCustomerEmail(order: StudioShopOrder): {
  subject: string;
  text: string;
} {
  const base = getAppUrl();
  const analyseTier = shopSlugToAnalysisTier(order.productSlug);
  const nextStep = analyseTier
    ? `${base}/business/analyse?tier=${analyseTier}&order=${encodeURIComponent(order.referenceId)}#analyse-formular`
    : typeof order.metadata.postPurchasePath === "string"
      ? `${base}${order.metadata.postPurchasePath}`
      : null;

  const lines = [
    `Guten Tag${order.customerName ? ` ${order.customerName}` : ""},`,
    "",
    "vielen Dank für Ihre Buchung bei UNZE Business.",
    "",
    `Auftrag: ${order.referenceId}`,
    `Leistung: ${order.productName}`,
    `Betrag: ${formatEuroCents(order.totalCents)}`,
    order.processingTime ? `Bearbeitungszeit: ${order.processingTime}` : "",
    "",
    "Wir beginnen mit der Bearbeitung und melden uns bei Rückfragen per E-Mail.",
  ].filter(Boolean);

  if (nextStep) {
    lines.push("", "Nächster Schritt — bitte Formular ausfüllen:", nextStep);
  }

  lines.push(
    "",
    "Bei Fragen antworten Sie einfach auf diese E-Mail.",
    "",
    "Mit freundlichen Grüßen",
    STUDIO_COMPANY_PROFILE.brandName,
    STUDIO_COMPANY_PROFILE.email,
  );

  return {
    subject: `Bestätigung — ${order.productName} (${order.referenceId})`,
    text: lines.join("\n"),
  };
}

export function buildShopOrderAdminEmail(order: StudioShopOrder): {
  subject: string;
  text: string;
} {
  const studioUrl = `${getAppUrl()}/studio/app/auftraege/${order.id}`;

  const lines = [
    "Neuer Shop-Auftrag (bezahlt)",
    "",
    `Referenz: ${order.referenceId}`,
    `Leistung: ${order.productName}`,
    `Betrag: ${formatEuroCents(order.totalCents)}`,
    `Kunde: ${order.customerName ?? "—"}`,
    `E-Mail: ${order.customerEmail}`,
    order.company ? `Unternehmen: ${order.company}` : "",
    order.source ? `Quelle: ${order.source}` : "",
    order.customerMessage ? `Nachricht: ${order.customerMessage}` : "",
    "",
    `Studio: ${studioUrl}`,
  ].filter(Boolean);

  return {
    subject: `[Shop] ${order.referenceId} — ${order.productName}`,
    text: lines.join("\n"),
  };
}

export function buildShopOutboundEmail(input: {
  order: StudioShopOrder;
  subject: string;
  body: string;
}): { subject: string; text: string } {
  const sig = STUDIO_COMPANY_PROFILE.email;
  return {
    subject: `${input.subject} (${input.order.referenceId})`,
    text: `${input.body.trim()}\n\n---\nUNZE Business\n${sig}\nAuftrag: ${input.order.referenceId}`,
  };
}
