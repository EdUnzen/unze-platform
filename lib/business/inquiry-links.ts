import type { AnalysisTierId } from "@/lib/constants/business-analysis-tiers";
import { shopSlugToAnalysisTier } from "@/lib/business/analysis-shop";
import type { ServicePackageTierId } from "@/lib/constants/business-service-package-tiers";

export const BUSINESS_KONTAKT_HREF = "/business/kontakt" as const;
export const BUSINESS_KONTAKT_FORM_ID = "anfrage" as const;

export type InquiryPrefill = {
  projectType?: string;
  analysisTier?: AnalysisTierId;
  servicePackage?: ServicePackageTierId | "undecided";
};

const SERVICE_SLUG_TO_PACKAGE: Record<string, ServicePackageTierId> = {
  "servicepaket-basis": "basis",
  "servicepaket-business": "business",
  "servicepaket-premium": "premium",
  "servicepaket-enterprise": "enterprise",
};

export function buildInquiryHref(prefill?: InquiryPrefill): string {
  const params = new URLSearchParams();
  if (prefill?.projectType) params.set("typ", prefill.projectType);
  if (prefill?.analysisTier) params.set("analyse", prefill.analysisTier);
  if (prefill?.servicePackage) params.set("paket", prefill.servicePackage);
  const qs = params.toString();
  return `${BUSINESS_KONTAKT_HREF}${qs ? `?${qs}` : ""}#${BUSINESS_KONTAKT_FORM_ID}`;
}

export function analysisTierToInquiryHref(tier: AnalysisTierId): string {
  return buildInquiryHref({ projectType: "analysis", analysisTier: tier });
}

export function shopSlugToInquiryHref(slug: string): string {
  const analysisTier = shopSlugToAnalysisTier(slug);
  if (analysisTier) {
    return buildInquiryHref({ projectType: "analysis", analysisTier });
  }

  const servicePackage = SERVICE_SLUG_TO_PACKAGE[slug];
  if (servicePackage) {
    return buildInquiryHref({ projectType: "service", servicePackage });
  }

  return buildInquiryHref();
}
