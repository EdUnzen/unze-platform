"use server";

import type { ProjectEstimate } from "@/lib/business/project-estimate.service";
import { getStudioSession } from "@/lib/studio/auth";
import { createQuoteCheckout } from "@/lib/studio/quote-checkout.service";
import { getStudioInquiryById } from "@/lib/studio/inquiries";
import {
  createQuoteFromInquiry,
  getStudioQuoteById,
  updateQuotePaymentPlan,
  updateStudioQuote,
} from "@/lib/studio/quotes";
import type { QuoteLineItem } from "@/lib/studio/quote-types";
import { isPaymentPlanId } from "@/lib/studio/payment-plans";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseEstimate(raw: unknown): ProjectEstimate | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as ProjectEstimate;
  if (typeof e.suggestedCents !== "number") return null;
  return e;
}

function parseLineItems(formData: FormData): QuoteLineItem[] {
  const raw = String(formData.get("lineItemsJson") ?? "[]");
  try {
    const parsed = JSON.parse(raw) as QuoteLineItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        typeof item.label === "string" &&
        typeof item.quantity === "number" &&
        typeof item.unitCents === "number",
    );
  } catch {
    return [];
  }
}

export async function createQuoteFromInquiryAction(formData: FormData) {
  const session = await getStudioSession();
  if (!session) redirect("/admin");

  const inquiryId = String(formData.get("inquiryId") ?? "");
  const inquiry = await getStudioInquiryById(inquiryId);
  if (!inquiry) redirect("/studio/app");

  const estimate = parseEstimate(inquiry.answers.estimate);
  if (!estimate) redirect(`/studio/app/inquiries/${inquiryId}?error=no-estimate`);

  const quote = await createQuoteFromInquiry({
    inquiryId: inquiry.id,
    customerName: inquiry.contactName,
    customerEmail: inquiry.contactEmail,
    company: inquiry.company,
    inquiryReferenceId: inquiry.referenceId,
    estimate,
  });

  if (!quote) redirect(`/studio/app/inquiries/${inquiryId}?error=quote-failed`);

  revalidatePath("/studio/app/angebote");
  revalidatePath(`/studio/app/inquiries/${inquiryId}`);
  redirect(`/studio/app/angebote/${quote.id}`);
}

export async function updateQuoteAction(formData: FormData) {
  const session = await getStudioSession();
  if (!session) redirect("/admin");

  const quoteId = String(formData.get("quoteId") ?? "");
  const lineItems = parseLineItems(formData);
  const title = String(formData.get("title") ?? "").trim() || undefined;
  const notes = String(formData.get("notes") ?? "").trim() || undefined;

  if (!quoteId || lineItems.length === 0) {
    redirect(`/studio/app/angebote/${quoteId}?error=invalid`);
  }

  await updateStudioQuote(quoteId, { title, notes, lineItems });
  revalidatePath(`/studio/app/angebote/${quoteId}`);
  redirect(`/studio/app/angebote/${quoteId}?saved=1`);
}

export async function updateQuotePaymentPlanAction(formData: FormData) {
  const session = await getStudioSession();
  if (!session) redirect("/admin");

  const quoteId = String(formData.get("quoteId") ?? "");
  const planRaw = String(formData.get("paymentPlan") ?? "full");

  if (!quoteId || !isPaymentPlanId(planRaw)) {
    redirect(`/studio/app/angebote/${quoteId}?error=invalid-plan`);
  }

  const quote = await updateQuotePaymentPlan(quoteId, planRaw);
  if (!quote) {
    redirect(`/studio/app/angebote/${quoteId}?error=plan-change-failed`);
  }

  revalidatePath(`/studio/app/angebote/${quoteId}`);
  redirect(`/studio/app/angebote/${quoteId}?saved=plan`);
}

export async function createQuotePaymentLinkAction(formData: FormData) {
  const session = await getStudioSession();
  if (!session) redirect("/admin");

  const quoteId = String(formData.get("quoteId") ?? "");
  const quote = await getStudioQuoteById(quoteId);
  if (!quote) redirect("/studio/app/angebote");

  const { url, error } = await createQuoteCheckout(quote);
  if (!url) {
    redirect(`/studio/app/angebote/${quoteId}?error=${encodeURIComponent(error ?? "checkout")}`);
  }

  revalidatePath(`/studio/app/angebote/${quoteId}`);
  redirect(`/studio/app/angebote/${quoteId}?paymentUrl=${encodeURIComponent(url)}`);
}
