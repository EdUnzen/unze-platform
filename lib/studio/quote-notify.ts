import { formatEmailSignature } from "@/lib/studio/company-profile";
import { formatEuroCents } from "@/lib/business/pricing-utils";
import { describePaymentPlan } from "@/lib/studio/payment-plans";
import type { StudioQuote } from "@/lib/studio/quote-types";

function getFromAddress(): string {
  return process.env.BUSINESS_EMAIL_FROM?.trim() || "UNZE Business <noreply@unze.app>";
}

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: getFromAddress(), to: [to], subject, text }),
  });

  if (!res.ok) {
    console.error("[studio/quote-notify] Resend failed:", await res.text());
    return false;
  }
  return true;
}

export async function notifyCustomerQuotePaymentReceived(quote: StudioQuote): Promise<void> {
  const subject = `[UNZE Business] Zahlungseingang — ${quote.referenceId}`;
  const text = [
    "Sehr geehrte Damen und Herren,",
    "",
    "vielen Dank für Ihre Zahlung.",
    "",
    `Angebot:     ${quote.referenceId}`,
    `Gesamt:      ${formatEuroCents(quote.chargeTotalCents)} (inkl. MwSt.)`,
    `Bezahlt:     ${formatEuroCents(quote.amountPaidCents)}`,
    quote.company ? `Unternehmen: ${quote.company}` : "",
    "",
    "Wir bestätigen den Zahlungseingang und melden uns mit den nächsten Projektschritten.",
    "",
    formatEmailSignature(),
  ]
    .filter(Boolean)
    .join("\n");

  await sendEmail(quote.customerEmail, subject, text);
}

export async function notifyCustomerQuoteDepositReceived(
  quote: StudioQuote,
  amountCents: number,
): Promise<void> {
  const subject = `[UNZE Business] Anzahlung erhalten — ${quote.referenceId}`;
  const text = [
    "Sehr geehrte Damen und Herren,",
    "",
    "vielen Dank für Ihre Anzahlung.",
    "",
    `Angebot:        ${quote.referenceId}`,
    `Anzahlung:      ${formatEuroCents(amountCents)}`,
    `Projektsumme:   ${formatEuroCents(quote.chargeTotalCents)}`,
    `Offen (Abnahme): ${formatEuroCents(quote.chargeTotalCents - quote.amountPaidCents)}`,
    "",
    "Wir starten mit der Projektumsetzung. Die Restzahlung erfolgt nach Abnahme.",
    "",
    formatEmailSignature(),
  ].join("\n");

  await sendEmail(quote.customerEmail, subject, text);
}

export async function notifyCustomerQuoteInstallmentReceived(
  quote: StudioQuote,
  installmentNumber: number,
  amountCents: number,
): Promise<void> {
  const total = quote.installmentCount ?? "?";
  const subject = `[UNZE Business] Rate ${installmentNumber}/${total} erhalten — ${quote.referenceId}`;
  const text = [
    "Sehr geehrte Damen und Herren,",
    "",
    `Ihre Rate ${installmentNumber} von ${total} ist eingegangen.`,
    "",
    `Betrag:    ${formatEuroCents(amountCents)}`,
    `Gesamt:    ${formatEuroCents(quote.amountPaidCents)} von ${formatEuroCents(quote.chargeTotalCents)}`,
    "",
    formatEmailSignature(),
  ].join("\n");

  await sendEmail(quote.customerEmail, subject, text);
}

export async function notifyAdminQuotePaymentReceived(
  quote: StudioQuote,
  kind = "Zahlung",
): Promise<void> {
  const to =
    process.env.BUSINESS_NOTIFY_EMAIL?.trim() ||
    process.env.BUSINESS_ADMIN_EMAIL?.trim() ||
    "support@unze.app";

  const subject = `[UNZE Studio] ${kind} — ${quote.referenceId}`;
  const text = [
    `${kind} für Business-Angebot.`,
    "",
    `Angebot:   ${quote.referenceId}`,
    `Kunde:     ${quote.customerName ?? "—"} (${quote.customerEmail})`,
    `Bezahlt:   ${formatEuroCents(quote.amountPaidCents)} / ${formatEuroCents(quote.chargeTotalCents)}`,
    `Plan:      ${describePaymentPlan(quote.paymentPlan, quote.totalCents)}`,
    quote.company ? `Firma:     ${quote.company}` : "",
    "",
    "UNZE Studio → Angebote",
  ]
    .filter(Boolean)
    .join("\n");

  await sendEmail(to, subject, text);
}

export function buildQuoteShareMessage(quote: StudioQuote, paymentUrl: string): string {
  return [
    `Hallo${quote.customerName ? ` ${quote.customerName}` : ""},`,
    "",
    `anbei Ihr Angebot ${quote.referenceId} von UNZE Business.`,
    describePaymentPlan(quote.paymentPlan, quote.totalCents),
    "",
    "Zahlung bequem online:",
    paymentUrl,
    "",
    "Bei Fragen antworten Sie bitte mit der Angebotsnummer.",
    "",
    formatEmailSignature(),
  ].join("\n");
}

export function buildQuoteMailtoLink(quote: StudioQuote, paymentUrl: string): string {
  const subject = encodeURIComponent(`UNZE Angebot ${quote.referenceId}`);
  const body = encodeURIComponent(buildQuoteShareMessage(quote, paymentUrl));
  return `mailto:${quote.customerEmail}?subject=${subject}&body=${body}`;
}

export function buildWhatsAppShareLink(quote: StudioQuote, paymentUrl: string): string {
  const text = encodeURIComponent(buildQuoteShareMessage(quote, paymentUrl));
  return `https://wa.me/?text=${text}`;
}
