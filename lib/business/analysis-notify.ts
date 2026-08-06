import {
  buildAdminAnalysisEmail,
  buildCustomerAnalysisReceiptEmail,
} from "@/lib/business/analysis-email";
import type { AnalysisInquiryAnswers } from "@/lib/business/analysis-inquiry.service";

export type AnalysisNotifyPayload = {
  referenceId: string;
  contactName: string | null;
  contactEmail: string;
  company: string | null;
  message: string | null;
  answers: AnalysisInquiryAnswers;
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
    console.error("[business/analysis-notify] Resend failed:", err);
    return false;
  }
  return true;
}

export async function notifyAdminOfAnalysisInquiry(payload: AnalysisNotifyPayload): Promise<void> {
  const email = buildAdminAnalysisEmail(payload);
  const sent = await sendEmail(getNotifyEmail(), email.subject, email.text);
  if (!sent) {
    console.info("[business/analysis-notify] Admin (E-Mail nicht konfiguriert):", {
      referenceId: payload.referenceId,
    });
  }
}

export async function notifyCustomerOfAnalysisReceipt(payload: AnalysisNotifyPayload): Promise<void> {
  const email = buildCustomerAnalysisReceiptEmail(payload);
  const sent = await sendEmail(payload.contactEmail, email.subject, email.text);
  if (!sent) {
    console.info("[business/analysis-notify] Kunde nicht benachrichtigt:", {
      referenceId: payload.referenceId,
    });
  }
}
