import { Check, Clock } from "lucide-react";
import { BusinessEyebrow, BusinessSection } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import {
  BUSINESS_PROCESSING_TIME,
  BUSINESS_WARRANTY,
  BUSINESS_WORKFLOW,
} from "@/lib/constants/business-pricing-policy";

type BusinessWorkflowSectionProps = {
  className?: string;
  showProcessingTime?: boolean;
  showWarranty?: boolean;
};

export function BusinessWorkflowSection({
  className = "",
  showProcessingTime = true,
  showWarranty = false,
}: BusinessWorkflowSectionProps) {
  const w = BUSINESS_WORKFLOW;
  const t = BUSINESS_PROCESSING_TIME;

  return (
    <BusinessSection className={className}>
      <BusinessScrollReveal>
        <div className="mx-auto max-w-3xl text-center">
          <BusinessEyebrow>{w.eyebrow}</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
            {w.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">{w.lead}</p>
          <p className="mt-4 text-sm font-semibold tracking-wide text-[#00C853]">{w.approachLine}</p>
        </div>
      </BusinessScrollReveal>

      <ol className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {w.steps.map((step, i) => (
          <BusinessScrollReveal key={step.title} delay={i * 60}>
            <li className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00C853]/10 text-sm font-bold text-[#00C853]">
                {i + 1}
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-gray-900">
                {step.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {step.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          </BusinessScrollReveal>
        ))}
      </ol>

      {showProcessingTime ? (
        <BusinessScrollReveal delay={120}>
          <div className="mx-auto mt-16 max-w-4xl rounded-3xl border border-gray-100 bg-gray-50 p-8 md:p-10">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-6 w-6 shrink-0 text-[#00C853]" aria-hidden />
              <div className="flex-1">
                <BusinessEyebrow>{t.eyebrow}</BusinessEyebrow>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 md:text-2xl">
                  {t.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">{t.lead}</p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                  {t.tiers.map((tier) => (
                    <li
                      key={tier.label}
                      className="rounded-xl border border-white bg-white px-4 py-4 text-center shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {tier.label}
                      </p>
                      <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">
                        {tier.duration}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </BusinessScrollReveal>
      ) : null}

      {showWarranty ? (
        <BusinessScrollReveal delay={160}>
          <blockquote className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
            <BusinessEyebrow>{BUSINESS_WARRANTY.eyebrow}</BusinessEyebrow>
            <p className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-gray-900">
              {BUSINESS_WARRANTY.title}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
              {BUSINESS_WARRANTY.text}
            </p>
          </blockquote>
        </BusinessScrollReveal>
      ) : null}
    </BusinessSection>
  );
}
