import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BusinessEyebrow, BusinessSection } from "@/components/business/BusinessUi";
import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";

/** Startseite — Analyse als zentrale Hauptleistung */
export function BusinessAnalysisPromoSection() {
  const c = BUSINESS_COPY.start.analysisPromo;

  return (
    <BusinessSection id="analyse-promo">
      <div className="overflow-hidden rounded-3xl border border-[#00C853]/20 bg-gray-950 text-white shadow-xl">
          <div className="grid lg:grid-cols-5">
            <div className="relative min-h-[240px] lg:col-span-2 lg:min-h-[360px]">
              <BusinessPhoto
                src={BUSINESS_IMAGERY.analysis.main}
                alt={BUSINESS_IMAGERY.analysis.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-950/20 to-gray-950" />
            </div>
            <div className="px-8 py-12 md:px-14 md:py-16 lg:col-span-3">
              <BusinessEyebrow>{c.eyebrow}</BusinessEyebrow>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight md:text-4xl">
                {c.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/75">{c.text}</p>
              <blockquote className="mt-6 border-l-2 border-[#00C853] pl-4 text-sm italic leading-relaxed text-white/70">
                {c.quote}
              </blockquote>
              <p className="mt-8">
                <Link
                  href={c.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white/75 transition hover:text-white hover:underline hover:underline-offset-4"
                >
                  {c.ctaPrimary}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </p>
              <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                {c.highlights.map((item, i) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white/85"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00C853]/20 text-xs font-bold text-[#00C853]">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
    </BusinessSection>
  );
}
