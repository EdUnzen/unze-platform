import { InquiryValidationError, submitProjectInquiry } from "@/lib/business/inquiry.service";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      contactName?: string;
      contactEmail?: string;
      company?: string;
      industry?: string;
      phone?: string;
      projectType?: string;
      serviceModel?: string;
      analysisTier?: string;
      servicePackage?: string;
  websiteScope?: string;
      projectTier?: string;
      hosting?: string;
      budget?: string;
      timeline?: string;
      preferredDate?: string;
      message?: string;
      modules?: string[];
      infrastructure?: string[];
      briefing?: import("@/lib/constants/business-pricing-mastermind").BriefingReadiness;
      website?: string;
    };

    const result = await submitProjectInquiry({
      contactName: body.contactName,
      contactEmail: body.contactEmail ?? "",
      company: body.company,
      industry: body.industry,
      phone: body.phone,
      projectType: body.projectType,
      serviceModel: body.serviceModel,
      analysisTier: body.analysisTier,
      servicePackage: body.servicePackage,
      websiteScope: body.websiteScope,
      projectTier: body.projectTier,
      hosting: body.hosting,
      budget: body.budget,
      timeline: body.timeline,
      preferredDate: body.preferredDate,
      message: body.message,
      modules: body.modules,
      infrastructure: body.infrastructure,
      briefing: body.briefing,
      honeypot: body.website,
    });

    return NextResponse.json({
      ok: true,
      referenceId: result.referenceId,
    });
  } catch (err) {
    if (err instanceof InquiryValidationError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    console.error("[api/business/inquiries/quick]", err);
    return NextResponse.json(
      { ok: false, error: "Anfrage konnte nicht verarbeitet werden" },
      { status: 500 },
    );
  }
}
