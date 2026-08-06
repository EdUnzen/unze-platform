import type { AnalysisTierId } from "@/lib/constants/business-analysis-tiers";
import { getAnalysisTier } from "@/lib/constants/business-analysis-tiers";

export type AnalysisInquiryAnswers = {
  tier: AnalysisTierId;
  tierStage: number;
  websiteUrl?: string;
  industry?: string;
  companySize?: string;
  goals?: string;
  description?: string;
  employeeCount?: string;
  currentSoftware?: string;
  offerProcess?: string;
  invoicing?: string;
  crm?: string;
  marketing?: string;
  problems?: string;
  improvements?: string;
  preferredCallDate?: string;
  systemAccessNote?: string;
  briefing?: import("@/lib/constants/business-pricing-mastermind").BriefingReadiness;
  paymentStatus?: "pending" | "paid" | "manual";
  stripeSessionId?: string;
  shopOrderReference?: string;
};

export type AnalysisInquiryInput = {
  tier: AnalysisTierId;
  contactName?: string | null;
  contactEmail: string;
  company?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  industry?: string | null;
  companySize?: string | null;
  goals?: string | null;
  description?: string | null;
  employeeCount?: string | null;
  currentSoftware?: string | null;
  offerProcess?: string | null;
  invoicing?: string | null;
  crm?: string | null;
  marketing?: string | null;
  problems?: string | null;
  improvements?: string | null;
  preferredCallDate?: string | null;
  systemAccessNote?: string | null;
  briefing?: import("@/lib/constants/business-pricing-mastermind").BriefingReadiness;
  honeypot?: string | null;
  shopOrderId?: string | null;
  shopOrderReference?: string | null;
  skipPayment?: boolean;
};

export type AnalysisInquiryResult = {
  referenceId: string;
  inquiryId: string;
  tier: AnalysisTierId;
  requiresPayment: boolean;
};

export class AnalysisValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisValidationError";
  }
}

function validateInput(input: AnalysisInquiryInput): void {
  if (input.honeypot) throw new AnalysisValidationError("Invalid submission");

  const tier = getAnalysisTier(input.tier);
  if (!tier) throw new AnalysisValidationError("Ungültige Analyse-Stufe");

  const email = input.contactEmail?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AnalysisValidationError("Gültige E-Mail erforderlich");
  }
  if (!input.company?.trim()) throw new AnalysisValidationError("Unternehmen erforderlich");
  if (!input.contactName?.trim()) throw new AnalysisValidationError("Ansprechpartner erforderlich");
  if (!input.industry?.trim()) throw new AnalysisValidationError("Branche erforderlich");
  if (!input.websiteUrl?.trim()) throw new AnalysisValidationError("Website-URL erforderlich");
  if (!input.companySize?.trim()) throw new AnalysisValidationError("Unternehmensgröße erforderlich");

  const goals = input.goals?.trim();
  if (!goals || goals.length < 10) {
    throw new AnalysisValidationError("Bitte beschreiben Sie Ihre Ziele (mindestens 10 Zeichen)");
  }

  if (tier.id !== "quick") {
    if (!input.currentSoftware?.trim()) {
      throw new AnalysisValidationError("Aktuelle Software erforderlich");
    }
    if (!input.problems?.trim()) {
      throw new AnalysisValidationError("Bitte beschreiben Sie Ihre aktuellen Probleme");
    }
    if (!input.improvements?.trim()) {
      throw new AnalysisValidationError("Bitte beschreiben Sie gewünschte Verbesserungen");
    }
  }

  if (tier.id === "premium" && !input.preferredCallDate?.trim()) {
    throw new AnalysisValidationError("Terminwunsch für das Gespräch erforderlich");
  }
}

function buildAnswers(input: AnalysisInquiryInput): AnalysisInquiryAnswers {
  const tier = getAnalysisTier(input.tier)!;
  return {
    tier: tier.id,
    tierStage: tier.stage,
    websiteUrl: input.websiteUrl?.trim(),
    industry: input.industry?.trim(),
    companySize: input.companySize?.trim(),
    goals: input.goals?.trim(),
    description: input.description?.trim() || undefined,
    employeeCount: input.employeeCount?.trim() || undefined,
    currentSoftware: input.currentSoftware?.trim() || undefined,
    offerProcess: input.offerProcess?.trim() || undefined,
    invoicing: input.invoicing?.trim() || undefined,
    crm: input.crm?.trim() || undefined,
    marketing: input.marketing?.trim() || undefined,
    problems: input.problems?.trim() || undefined,
    improvements: input.improvements?.trim() || undefined,
    preferredCallDate: input.preferredCallDate?.trim() || undefined,
    systemAccessNote: input.systemAccessNote?.trim() || undefined,
    briefing: input.briefing,
    paymentStatus: tier.requiresPayment ? "pending" : undefined,
  };
}

function buildMessage(input: AnalysisInquiryInput): string {
  const parts = [
    input.description?.trim(),
    input.goals?.trim() ? `Ziele: ${input.goals.trim()}` : null,
    input.problems?.trim() ? `Probleme: ${input.problems.trim()}` : null,
    input.improvements?.trim() ? `Verbesserungen: ${input.improvements.trim()}` : null,
  ].filter(Boolean);
  return parts.join("\n\n") || input.goals!.trim();
}

export async function submitAnalysisInquiry(
  input: AnalysisInquiryInput,
): Promise<AnalysisInquiryResult> {
  validateInput(input);

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  if (!admin) throw new Error("Datenbank nicht konfiguriert");

  const tier = getAnalysisTier(input.tier)!;
  const paidViaShop = input.skipPayment === true;
  const answers = buildAnswers(input);
  if (paidViaShop) {
    answers.paymentStatus = "paid";
    if (input.shopOrderReference) {
      answers.shopOrderReference = input.shopOrderReference;
    }
  }
  const initialStatus = paidViaShop
    ? "paid"
    : tier.requiresPayment
      ? "awaiting_payment"
      : "received";

  const row = {
    inquiry_type: "analysis",
    contact_name: input.contactName?.trim() || null,
    contact_email: input.contactEmail.trim(),
    company: input.company?.trim() || null,
    message: buildMessage(input),
    answers,
    status: initialStatus,
  };

  const { data: businessRow, error: businessError } = await admin
    .schema("business")
    .from("inquiries")
    .insert(row)
    .select("id, reference_id")
    .single();

  if (businessError || !businessRow) {
    console.error("[business/analysis-inquiry]", businessError);
    throw new Error("Analyse-Anfrage konnte nicht gespeichert werden");
  }

  const studioRow = {
    business_inquiry_id: businessRow.id,
    reference_id: businessRow.reference_id,
    inquiry_type: "analysis",
    contact_name: row.contact_name,
    contact_email: row.contact_email,
    company: row.company,
    message: row.message,
    answers,
    status: paidViaShop ? "neue_anfrage" : tier.requiresPayment ? "zahlung_ausstehend" : "neue_anfrage",
  };

  const { data: studioInquiry, error: studioError } = await admin
    .schema("studio")
    .from("inquiries")
    .insert(studioRow)
    .select("id")
    .single();

  if (studioError || !studioInquiry) {
    console.error("[studio/analysis-inquiry]", studioError);
    await admin.schema("business").from("inquiries").update({ status: "error" }).eq("id", businessRow.id);
    throw new Error("Studio-Anlage fehlgeschlagen");
  }

  if (input.shopOrderId) {
    await admin
      .schema("studio")
      .from("shop_orders")
      .update({
        inquiry_id: studioInquiry.id as string,
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.shopOrderId);
  }

  if (!tier.requiresPayment || paidViaShop) {
    await admin
      .schema("business")
      .from("inquiries")
      .update({ status: paidViaShop ? "paid" : "ingested" })
      .eq("id", businessRow.id);

    const { notifyAdminOfAnalysisInquiry, notifyCustomerOfAnalysisReceipt } = await import(
      "@/lib/business/analysis-notify"
    );
    const payload = {
      referenceId: businessRow.reference_id,
      contactName: row.contact_name,
      contactEmail: row.contact_email,
      company: row.company,
      message: row.message,
      answers,
    };
    await Promise.all([
      notifyAdminOfAnalysisInquiry(payload),
      notifyCustomerOfAnalysisReceipt(payload),
    ]);
  }

  return {
    referenceId: businessRow.reference_id,
    inquiryId: businessRow.id,
    tier: tier.id,
    requiresPayment: tier.requiresPayment && !paidViaShop,
  };
}

export async function markAnalysisInquiryPaid(input: {
  inquiryId: string;
  stripeSessionId: string;
}): Promise<void> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  if (!admin) throw new Error("Datenbank nicht konfiguriert");

  const { data: row, error: fetchError } = await admin
    .schema("business")
    .from("inquiries")
    .select("id, reference_id, contact_name, contact_email, company, message, answers")
    .eq("id", input.inquiryId)
    .eq("inquiry_type", "analysis")
    .maybeSingle();

  if (fetchError || !row) {
    throw new Error(`Analyse-Anfrage ${input.inquiryId} nicht gefunden`);
  }

  const answers = {
    ...(row.answers as AnalysisInquiryAnswers),
    paymentStatus: "paid" as const,
    stripeSessionId: input.stripeSessionId,
  };

  const { error: updateError } = await admin
    .schema("business")
    .from("inquiries")
    .update({ status: "paid", answers })
    .eq("id", input.inquiryId);

  if (updateError) throw new Error(updateError.message);

  await admin
    .schema("studio")
    .from("inquiries")
    .update({ status: "zahlung_erhalten", answers })
    .eq("business_inquiry_id", input.inquiryId);

  const { notifyAdminOfAnalysisInquiry, notifyCustomerOfAnalysisReceipt } = await import(
    "@/lib/business/analysis-notify"
  );
  const payload = {
    referenceId: row.reference_id,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    company: row.company,
    message: row.message,
    answers,
  };
  await Promise.all([
    notifyAdminOfAnalysisInquiry(payload),
    notifyCustomerOfAnalysisReceipt(payload),
  ]);
}
