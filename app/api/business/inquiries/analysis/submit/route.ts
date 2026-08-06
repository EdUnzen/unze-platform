import {
  AnalysisValidationError,
  submitAnalysisInquiry,
} from "@/lib/business/analysis-inquiry.service";
import { createAnalysisCheckout } from "@/lib/business/analysis-checkout.service";
import { getPaidAnalysisShopOrder } from "@/lib/business/analysis-shop";
import { isAnalysisTierId, type AnalysisTierId } from "@/lib/constants/business-analysis-tiers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function redirectToAnalyse(request: Request, tier: AnalysisTierId, error: string) {
  const url = new URL("/business/analyse", request.url);
  url.searchParams.set("tier", tier);
  url.searchParams.set("error", error);
  url.hash = "analyse-formular";
  return NextResponse.redirect(url, 303);
}

function formValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const tierRaw = formValue(formData, "tier") ?? "quick";
  const tier: AnalysisTierId = isAnalysisTierId(tierRaw) ? tierRaw : "quick";
  const shopOrderReference = formValue(formData, "shopOrderReference");

  try {
    const paidOrder = shopOrderReference
      ? await getPaidAnalysisShopOrder({ orderReference: shopOrderReference, tier })
      : null;

    if (shopOrderReference && !paidOrder) {
      return redirectToAnalyse(
        request,
        tier,
        "Ungültiger oder unbezahlter Shop-Auftrag. Bitte zuerst im Shop buchen.",
      );
    }

    const result = await submitAnalysisInquiry({
      tier,
      contactName: formValue(formData, "contactName"),
      contactEmail: formValue(formData, "contactEmail") ?? "",
      company: formValue(formData, "company"),
      phone: formValue(formData, "phone"),
      websiteUrl: formValue(formData, "websiteUrl"),
      industry: formValue(formData, "industry"),
      companySize: formValue(formData, "companySize"),
      goals: formValue(formData, "goals"),
      description: formValue(formData, "description"),
      employeeCount: formValue(formData, "employeeCount"),
      currentSoftware: formValue(formData, "currentSoftware"),
      offerProcess: formValue(formData, "offerProcess"),
      invoicing: formValue(formData, "invoicing"),
      crm: formValue(formData, "crm"),
      marketing: formValue(formData, "marketing"),
      problems: formValue(formData, "problems"),
      improvements: formValue(formData, "improvements"),
      preferredCallDate: formValue(formData, "preferredCallDate"),
      systemAccessNote: formValue(formData, "systemAccessNote"),
      honeypot: formValue(formData, "website"),
      shopOrderId: paidOrder?.id ?? null,
      shopOrderReference: paidOrder?.referenceId ?? null,
      skipPayment: Boolean(paidOrder),
    });

    if (result.requiresPayment && !paidOrder) {
      const checkout = await createAnalysisCheckout({
        inquiryId: result.inquiryId,
        referenceId: result.referenceId,
        tier: result.tier,
        customerEmail: (formValue(formData, "contactEmail") ?? "").trim(),
        companyName: formValue(formData, "company"),
      });

      if (checkout.url) {
        return NextResponse.redirect(checkout.url, 303);
      }

      const successUrl = new URL("/business/analyse/erfolg", request.url);
      successUrl.searchParams.set("ref", result.referenceId);
      successUrl.searchParams.set(
        "note",
        checkout.error ??
          "Ihre Anfrage wurde gespeichert. Wir melden uns zur Zahlungsabwicklung.",
      );
      return NextResponse.redirect(successUrl, 303);
    }

    const successUrl = new URL("/business/analyse/erfolg", request.url);
    successUrl.searchParams.set("ref", result.referenceId);
    return NextResponse.redirect(successUrl, 303);
  } catch (err) {
    const message =
      err instanceof AnalysisValidationError
        ? err.message
        : "Analyse-Anfrage konnte nicht verarbeitet werden";
    console.error("[api/business/inquiries/analysis/submit]", err);
    return redirectToAnalyse(request, tier, message);
  }
}
