import { notifyAdminOfInquiry, notifyCustomerOfInquiryReceipt } from "@/lib/business/notify";
import { calculateProjectEstimate } from "@/lib/business/project-estimate.service";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProjectInquiryAnswers } from "@/lib/business/inquiry-email";

export type ProjectInquiryInput = {
  contactName?: string | null;
  contactEmail: string;
  company?: string | null;
  industry?: string | null;
  phone?: string | null;
  projectType?: string | null;
  serviceModel?: string | null;
  analysisTier?: string | null;
  servicePackage?: string | null;
  websiteScope?: string | null;
  projectTier?: string | null;
  hosting?: string | null;
  budget?: string | null;
  timeline?: string | null;
  preferredDate?: string | null;
  message?: string | null;
  modules?: string[];
  infrastructure?: string[];
  briefing?: import("@/lib/constants/business-pricing-mastermind").BriefingReadiness;
  honeypot?: string | null;
};

export type InquiryResult = {
  referenceId: string;
  inquiryId: string;
};

export class InquiryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InquiryValidationError";
  }
}

function validateProjectInput(input: ProjectInquiryInput): void {
  if (input.honeypot) throw new InquiryValidationError("Invalid submission");

  const email = input.contactEmail?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new InquiryValidationError("Gültige E-Mail erforderlich");
  }
  if (!input.company?.trim()) throw new InquiryValidationError("Unternehmen erforderlich");
  if (!input.contactName?.trim()) throw new InquiryValidationError("Ansprechpartner erforderlich");
  if (!input.industry?.trim()) throw new InquiryValidationError("Branche erforderlich");
  if (!input.projectType?.trim()) throw new InquiryValidationError("Gewünschte Lösung erforderlich");
  if (!input.hosting?.trim()) throw new InquiryValidationError("Hosting-Situation erforderlich");
  const message = input.message?.trim();
  if (!message || message.length < 20) {
    throw new InquiryValidationError("Bitte beschreiben Sie Ihr Projekt (mindestens 20 Zeichen)");
  }
}

function buildAnswers(input: ProjectInquiryInput): ProjectInquiryAnswers {
  return {
    industry: input.industry?.trim(),
    projectType: input.projectType!.trim(),
    phone: input.phone?.trim(),
    serviceModel: input.serviceModel?.trim() || undefined,
    analysisTier: input.analysisTier?.trim() || undefined,
    servicePackage: input.servicePackage?.trim() || undefined,
    websiteScope: input.websiteScope?.trim() || undefined,
    projectTier: input.projectTier?.trim() || undefined,
    hosting: input.hosting!.trim(),
    budget: input.budget?.trim() || undefined,
    timeline: input.timeline?.trim() || undefined,
    preferredDate: input.preferredDate?.trim() || undefined,
    modules: input.modules?.length ? input.modules : undefined,
    infrastructure: input.infrastructure?.length ? input.infrastructure : undefined,
    briefing: input.briefing,
  };
}

export async function submitProjectInquiry(input: ProjectInquiryInput): Promise<InquiryResult> {
  validateProjectInput(input);

  const admin = createAdminClient();
  if (!admin) throw new Error("Datenbank nicht konfiguriert");

  const answers = buildAnswers(input);
  const estimate = calculateProjectEstimate(answers, { message: input.message });
  const answersWithEstimate = { ...answers, estimate };

  const row = {
    inquiry_type: "project",
    contact_name: input.contactName?.trim() || null,
    contact_email: input.contactEmail.trim(),
    company: input.company?.trim() || null,
    message: input.message?.trim() || null,
    answers: answersWithEstimate,
    status: "received",
  };

  const { data: businessRow, error: businessError } = await admin
    .schema("business")
    .from("inquiries")
    .insert(row)
    .select("id, reference_id")
    .single();

  if (businessError || !businessRow) {
    console.error("[business/inquiry]", businessError);
    throw new Error("Anfrage konnte nicht gespeichert werden");
  }

  const studioRow = {
    business_inquiry_id: businessRow.id,
    reference_id: businessRow.reference_id,
    inquiry_type: "project",
    contact_name: row.contact_name,
    contact_email: row.contact_email,
    company: row.company,
    message: row.message,
    answers: answersWithEstimate,
    status: "neue_anfrage",
  };

  const { error: studioError } = await admin.schema("studio").from("inquiries").insert(studioRow);

  if (studioError) {
    console.error("[studio/inquiry]", studioError);
    await admin.schema("business").from("inquiries").update({ status: "error" }).eq("id", businessRow.id);
    throw new Error("Studio-Anlage fehlgeschlagen");
  }

  await admin
    .schema("business")
    .from("inquiries")
    .update({ status: "ingested" })
    .eq("id", businessRow.id);

  const payload = {
    referenceId: businessRow.reference_id,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    company: row.company,
    message: row.message,
    answers: answersWithEstimate,
  };

  await Promise.all([
    notifyAdminOfInquiry(payload),
    notifyCustomerOfInquiryReceipt(payload),
  ]);

  return { referenceId: businessRow.reference_id, inquiryId: businessRow.id };
}

/** @deprecated Alias für Abwärtskompatibilität */
export const submitQuickInquiry = submitProjectInquiry;
export type QuickInquiryInput = ProjectInquiryInput;
