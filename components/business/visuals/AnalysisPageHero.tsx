import { BusinessCtaButton, BusinessEyebrow } from "@/components/business/BusinessUi";
import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";
import { buildInquiryHref } from "@/lib/business/inquiry-links";
type AnalysisPageHeroProps = {
  eyebrow: string;
  headline: string;
  subline: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

export function AnalysisPageHero({
  eyebrow,
  headline,
  subline,
  ctaPrimary,
  ctaSecondary,
}: AnalysisPageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gray-950 text-white">
      <BusinessPhoto
        src={BUSINESS_IMAGERY.analysis.main}
        alt={BUSINESS_IMAGERY.analysis.alt}
        fill
        className="absolute inset-0 opacity-25"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-950/88 to-emerald-950/40" />
      <div className="relative container mx-auto max-w-6xl px-4 py-20 md:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
          <BusinessEyebrow>{eyebrow}</BusinessEyebrow>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.06] tracking-tight md:text-5xl lg:text-[3.25rem]">
            {headline}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/80 md:text-xl">{subline}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
            <BusinessCtaButton href="#analyse-buchen" variant="primary">
              {ctaPrimary}
            </BusinessCtaButton>
            <BusinessCtaButton href={buildInquiryHref({ projectType: "analysis" })} variant="ghost">
              Analyse anfragen
            </BusinessCtaButton>
            <BusinessCtaButton href="#analyse-beispiele" variant="ghost">
              {ctaSecondary}
            </BusinessCtaButton>
          </div>        </div>
      </div>
    </section>
  );
}
