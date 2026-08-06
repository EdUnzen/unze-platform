/**
 * Benachrichtigungen bei neuer Business-Anfrage.
 */

import {
  buildAdminInquiryEmail,
  buildCustomerReceiptEmail,
  type ProjectInquiryAnswers,
} from "@/lib/business/inquiry-email";

export type InquiryNotifyPayload = {
  referenceId: string;
  contactName: string | null;
  contactEmail: string;
  company: string | null;
  message: string | null;
  answers?: ProjectInquiryAnswers & Record<string, unknown>;
};

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
    const err = await res.text();
    console.error("[business/notify] Resend failed:", err);
    return false;
  }
  return true;
}

export async function notifyAdminOfInquiry(payload: InquiryNotifyPayload): Promise<void> {
  const to = getNotifyEmail();
  const email = buildAdminInquiryEmail({
    referenceId: payload.referenceId,
    contactName: payload.contactName,
    contactEmail: payload.contactEmail,
    company: payload.company,
    message: payload.message,
    answers: (payload.answers ?? { projectType: "other" }) as ProjectInquiryAnswers,
  });

  const sent = await sendEmail(to, email.subject, email.text);
  if (!sent) {
    console.info("[business/notify] Neue Anfrage (Admin-E-Mail nicht konfiguriert):", {
      to,
      referenceId: payload.referenceId,
    });
  }
}

export async function notifyCustomerOfInquiryReceipt(payload: InquiryNotifyPayload): Promise<void> {
  const email = buildCustomerReceiptEmail({
    referenceId: payload.referenceId,
    contactName: payload.contactName,
    contactEmail: payload.contactEmail,
    company: payload.company,
    message: payload.message,
    answers: (payload.answers ?? { projectType: "other" }) as ProjectInquiryAnswers,
  });

  const sent = await sendEmail(payload.contactEmail, email.subject, email.text);
  if (!sent) {
    console.info("[business/notify] Kunden-Bestätigung nicht versendet:", {
      to: payload.contactEmail,
      referenceId: payload.referenceId,
    });
  }
}
