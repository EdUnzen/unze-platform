import { BusinessLink } from "@/components/business/BusinessLink";
import { buildInquiryHref } from "@/lib/business/inquiry-links";
import { FileText } from "lucide-react";

/** Sticky-Leiste auf der Analyse-Seite — Anfrage statt Shop */
export function AnalysisPageShopBar() {
  return (
    <div className="sticky top-14 z-40 border-b border-[#00C853]/20 bg-white/95 shadow-sm backdrop-blur-md md:top-[6.75rem]">
      <div className="container mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4 text-[#00C853]" aria-hidden />
          <span>Analyse & Projekte über das Anfrageformular — persönliche Bearbeitung im Studio</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BusinessLink
            href="#analyse-beispiele"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            Beispiele ansehen
          </BusinessLink>
          <BusinessLink
            href="#analyse-stufen"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            Stufen & Preise
          </BusinessLink>
          <BusinessLink
            href={buildInquiryHref({ projectType: "analysis" })}
            className="rounded-full bg-[#00C853] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#00b34a]"
          >
            Analyse anfragen
          </BusinessLink>
        </div>
      </div>
    </div>
  );
}
