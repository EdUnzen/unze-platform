import { BusinessEyebrow, BusinessSection } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { ProcessTimeline } from "@/components/business/visuals/ProcessTimeline";
import { PRICING_EXPLAINER } from "@/lib/constants/business-pricing-policy";

export function BusinessPricingExplainerSection({ className = "" }: { className?: string }) {
  const e = PRICING_EXPLAINER;

  return (
    <BusinessSection className={className}>
      <BusinessScrollReveal>
        <div className="mx-auto max-w-2xl text-center">
          <BusinessEyebrow>{e.eyebrow}</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
            {e.title}
          </h2>
          <p className="mt-4 text-gray-600">{e.lead}</p>
        </div>
      </BusinessScrollReveal>
      <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
        {e.why.map((item) => (
          <li
            key={item}
            className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm"
          >
            {item}
          </li>
        ))}
      </ul>
      <div className="mx-auto mt-14 max-w-5xl">
        <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-gray-500">
          Projektablauf
        </h3>
        <div className="mt-8">
          <ProcessTimeline steps={e.process.map((s) => ({ step: s.step, detail: s.detail }))} />
        </div>
      </div>
    </BusinessSection>
  );
}
