import { ClipboardCheck } from "lucide-react";
import { BusinessEyebrow, BusinessSection } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { PROJECT_ACCEPTANCE } from "@/lib/constants/business-pricing-policy";

export function BusinessProjectAcceptanceSection({ className = "" }: { className?: string }) {
  const a = PROJECT_ACCEPTANCE;

  return (
    <BusinessSection className={className}>
      <BusinessScrollReveal>
        <div className="mx-auto max-w-2xl text-center">
          <BusinessEyebrow>{a.eyebrow}</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
            {a.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600">{a.lead}</p>
        </div>
      </BusinessScrollReveal>
      <ol className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
        {a.steps.map((step, i) => (
          <BusinessScrollReveal key={step.title} delay={i * 70}>
            <li className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00C853]/10 text-sm font-bold text-[#00C853]">
                {i + 1}
              </span>
              <ClipboardCheck className="mt-4 h-5 w-5 text-gray-400" aria-hidden />
              <h3 className="mt-2 font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{step.text}</p>
            </li>
          </BusinessScrollReveal>
        ))}
      </ol>
      <BusinessScrollReveal delay={200}>
        <blockquote className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-100 bg-gray-50 p-8 text-sm leading-relaxed text-gray-600 md:text-base">
          {a.warrantyText}
        </blockquote>
      </BusinessScrollReveal>
    </BusinessSection>
  );
}
