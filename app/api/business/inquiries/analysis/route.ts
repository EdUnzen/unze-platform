import {
  AnalysisValidationError,
  submitAnalysisInquiry,
} from "@/lib/business/analysis-inquiry.service";
import { createAnalysisCheckout } from "@/lib/business/analysis-checkout.service";
import { isAnalysisTierId } from "@/lib/constants/business-analysis-tiers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const tier = typeof body.tier === "string" ? body.tier : "";

    if (!isAnalysisTierId(tier)) {
      return NextResponse.json({ ok: false, error: "Ungültige Analyse-Stufe" }, { status: 400 });
    }

    const result = await submitAnalysisInquiry({
      tier,
      contactName: body.contactName as string | undefined,
      contactEmail: (body.contactEmail as string) ?? "",
      company: body.company as string | undefined,
      phone: body.phone as string | undefined,
      websiteUrl: body.websiteUrl as string | undefined,
      industry: body.industry as string | undefined,
      companySize: body.companySize as string | undefined,
      goals: body.goals as string | undefined,
      description: body.description as string | undefined,
      employeeCount: body.employeeCount as string | undefined,
      currentSoftware: body.currentSoftware as string | undefined,
      offerProcess: body.offerProcess as string | undefined,
      invoicing: body.invoicing as string | undefined,
      crm: body.crm as string | undefined,
      marketing: body.marketing as string | undefined,
      problems: body.problems as string | undefined,
      improvements: body.improvements as string | undefined,
      preferredCallDate: body.preferredCallDate as string | undefined,
      systemAccessNote: body.systemAccessNote as string | undefined,
      briefing: body.briefing as
        | import("@/lib/constants/business-pricing-mastermind").BriefingReadiness
        | undefined,
      honeypot: body.website as string | undefined,
    });

    if (result.requiresPayment) {
      const checkout = await createAnalysisCheckout({
        inquiryId: result.inquiryId,
        referenceId: result.referenceId,
        tier: result.tier,
        customerEmail: (body.contactEmail as string).trim(),
        companyName: body.company as string | undefined,
      });

      if (checkout.url) {
        return NextResponse.json({
          ok: true,
          referenceId: result.referenceId,
          checkoutUrl: checkout.url,
        });
      }

      return NextResponse.json({
        ok: true,
        referenceId: result.referenceId,
        checkoutUrl: null,
        paymentNote:
          checkout.error ??
          "Ihre Anfrage wurde gespeichert. Wir melden uns zur Zahlungsabwicklung.",
      });
    }

    return NextResponse.json({
      ok: true,
      referenceId: result.referenceId,
      checkoutUrl: null,
    });
  } catch (err) {
    if (err instanceof AnalysisValidationError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    console.error("[api/business/inquiries/analysis]", err);
    return NextResponse.json(
      { ok: false, error: "Analyse-Anfrage konnte nicht verarbeitet werden" },
      { status: 500 },
    );
  }
}
