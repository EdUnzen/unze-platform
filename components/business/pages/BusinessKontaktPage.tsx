import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Check, Sparkles } from "lucide-react";
import { BusinessFaqAccordion } from "@/components/business/BusinessFaqAccordion";
import { BusinessEyebrow, BusinessSection } from "@/components/business/BusinessUi";
import { KontaktPremiumHero } from "@/components/business/visuals/KontaktPremiumHero";
import { GradientOrbs } from "@/components/business/visuals/GradientOrbs";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";

const BusinessProjectInquiryForm = dynamic(
  () =>
    import("@/components/business/BusinessProjectInquiryForm").then((m) => m.BusinessProjectInquiryForm),
  { loading: () => <p className="text-sm text-gray-500">Formular wird geladen…</p> },
);

export function BusinessKontaktPage() {
  const c = BUSINESS_COPY.kontakt;

  return (
    <>
      <KontaktPremiumHero {...c.hero} />
      <BusinessSection className="relative overflow-hidden">
        <GradientOrbs />
        <div className="relative grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="rounded-2xl border border-[#00C853]/15 bg-gradient-to-br from-[#00C853]/5 via-white to-indigo-50/30 p-8 shadow-sm">
              <div className="inline-flex items-center gap-2 text-[#00C853]">
                <Sparkles className="h-4 w-4" aria-hidden />
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-gray-900">
                  {c.sidebar.title}
                </h2>
              </div>
              <ul className="mt-6 space-y-4">
                {c.sidebar.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10">
              <BusinessEyebrow>FAQ</BusinessEyebrow>
              <div className="mt-4">
                <BusinessFaqAccordion theme="light" />
              </div>
            </div>
          </div>
          <div
            id="anfrage"
            className="relative scroll-mt-28 rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl shadow-gray-900/5 ring-1 ring-[#00C853]/10 md:p-9"
          >
            <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br from-[#00C853]/20 via-transparent to-indigo-500/10 opacity-60 blur-sm" />
            <Suspense fallback={<p className="text-sm text-gray-500">Formular wird geladen…</p>}>
              <BusinessProjectInquiryForm />
            </Suspense>
          </div>
        </div>
      </BusinessSection>
    </>
  );
}
