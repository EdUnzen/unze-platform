"use client";

import { BusinessLink } from "@/components/business/BusinessLink";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import { buildInquiryHref } from "@/lib/business/inquiry-links";
import { FileText } from "lucide-react";

type BusinessInquiryButtonProps = {
  variant?: "header" | "hero" | "bar";
  className?: string;
  onNavigate?: () => void;
  /** Vorauswahl im Formular */
  projectType?: string;
  analysisTier?: "quick" | "business" | "premium";
  servicePackage?: "basis" | "business" | "premium" | "enterprise" | "undecided";
};

/** @deprecated Alias — früher BusinessShopButton */
export type BusinessShopButtonProps = BusinessInquiryButtonProps;

export function BusinessInquiryButton({
  variant = "header",
  className = "",
  onNavigate,
  projectType,
  analysisTier,
  servicePackage,
}: BusinessInquiryButtonProps) {
  const href = buildInquiryHref({ projectType, analysisTier, servicePackage });

  const base =
    variant === "hero"
      ? "inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
      : variant === "bar"
        ? "inline-flex items-center gap-2 rounded-full bg-[#00C853] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00b34a]"
        : "inline-flex h-10 items-center gap-2 rounded-full border-2 border-[#00C853] bg-[#00C853]/10 px-4 text-sm font-bold text-[#007a3d] shadow-sm transition hover:bg-[#00C853]/15";

  const label =
    variant === "bar" || variant === "hero"
      ? BUSINESS_COPY.nav.cta
      : BUSINESS_COPY.nav.inquiryCta;

  return (
    <BusinessLink href={href} onClick={onNavigate} className={`${base} ${className}`}>
      <FileText className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </BusinessLink>
  );
}

/** @deprecated Nutze BusinessInquiryButton — Shop wurde entfernt */
export const BusinessShopButton = BusinessInquiryButton;
