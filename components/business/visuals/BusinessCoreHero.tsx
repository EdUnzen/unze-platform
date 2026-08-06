import { Check } from "lucide-react";
import {
  BusinessCtaButton,
  BusinessEyebrow,
} from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { BusinessMockDisclaimer } from "@/components/business/visuals/BusinessMockDisclaimer";
import { IndustryMockStage } from "@/components/business/visuals/IndustryMockStage";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";

type BusinessCoreHeroProps = {
  eyebrow: string;
  headline: string;
  subline: string;
  intro: string;
  emotionalHook: string;
  benefits: readonly { title: string; text: string }[];
};

export function BusinessCoreHero({
  eyebrow,
  headline,
  subline,
  intro,
  emotionalHook,
  benefits,
}: BusinessCoreHeroProps) {
  const image = BUSINESS_IMAGERY.services["business-core"];

  return (
    <>
      <section className="relative overflow-hidden bg-gray-950 text-white">
        <BusinessPhoto
          src={image.src}
          alt=""
          fill
          className="absolute inset-0 opacity-30"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-950/85 to-gray-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/40" />

        <div className="relative container mx-auto max-w-7xl px-4 py-20 md:py-28 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl">
              <BusinessEyebrow>{eyebrow}</BusinessEyebrow>
              <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.06] tracking-tight md:text-5xl lg:text-[3.25rem]">
                {headline}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/75 md:text-xl">{subline}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <BusinessCtaButton href="/business/kontakt" variant="primary">
                  Business Core anfragen
                </BusinessCtaButton>
                <BusinessCtaButton href="/business/preise" variant="ghost">
                  Pakete & Preise
                </BusinessCtaButton>
              </div>
              <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                {benefits.map((item) => (
                  <li
                    key={item.title}
                    className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm backdrop-blur-sm"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                    <span>
                      <span className="font-semibold text-white">{item.title}</span>
                      <span className="text-white/65"> — {item.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <BusinessScrollReveal delay={120} className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-[#00C853]/10 blur-3xl" aria-hidden />
              <IndustryMockStage
                industry="umzug"
                variant="dashboard"
                device="laptop"
                label="Business Core — Dashboard"
              />
              <BusinessMockDisclaimer variant="inline" className="mt-3 text-white/55" />
            </BusinessScrollReveal>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="text-lg leading-relaxed text-gray-600 md:text-xl">{intro}</p>
          <blockquote className="mx-auto mt-6 max-w-2xl border-l-4 border-[#00C853] pl-5 text-left text-base font-medium leading-relaxed text-gray-800 md:text-lg">
            {emotionalHook}
          </blockquote>
        </div>
      </section>
    </>
  );
}
