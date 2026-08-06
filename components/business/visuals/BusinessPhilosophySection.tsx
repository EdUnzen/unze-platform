import { Check, Sparkles } from "lucide-react";
import { BusinessEyebrow, BusinessSection } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { BUSINESS_PHILOSOPHY } from "@/lib/constants/business-pricing-policy";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";

export function BusinessPhilosophySection({ className = "" }: { className?: string }) {
  const p = BUSINESS_PHILOSOPHY;

  return (
    <BusinessSection className={className}>
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <BusinessScrollReveal>
          <BusinessEyebrow>{p.eyebrow}</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
            {p.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">{p.lead}</p>

          <div className="mt-8 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-7 md:p-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#00C853]" aria-hidden />
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900">
                {p.values.title}
              </h3>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-1">
              {p.values.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-gray-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">{p.kiPractice.title}</h3>
            <ul className="mt-4 space-y-2">
              {p.kiPractice.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </BusinessScrollReveal>

        <BusinessScrollReveal delay={120}>
          <div className={`relative overflow-hidden ${BUSINESS_VISUAL.photoAspect} lg:aspect-[4/5] rounded-3xl shadow-lg`}>
            <BusinessPhoto
              src={BUSINESS_IMAGERY.philosophy.src}
              alt={BUSINESS_IMAGERY.philosophy.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 text-sm font-medium leading-relaxed text-white/90">
              {p.tagline}
            </p>
          </div>
        </BusinessScrollReveal>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {p.points.map((point, i) => (
          <BusinessScrollReveal key={point} delay={i * 60}>
            <div className="flex h-full gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#00C853]" aria-hidden />
              <p className="text-sm leading-relaxed text-gray-700">{point}</p>
            </div>
          </BusinessScrollReveal>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-gray-600">
        {p.communication}
      </p>
    </BusinessSection>
  );
}
