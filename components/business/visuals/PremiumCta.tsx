import { ArrowRight, Sparkles } from "lucide-react";
import { BUSINESS_CTA_HREF } from "@/lib/constants/business-site";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { MockScreen } from "@/components/business/visuals/MockScreen";
import { GradientOrbs } from "@/components/business/visuals/GradientOrbs";
import type { MockVariant } from "@/components/business/visuals/MockScreen";
import type { DeviceVariant } from "@/components/business/visuals/DeviceFrame";

export function PremiumCta({
  title,
  text,
  cta,
  href = BUSINESS_CTA_HREF,
  ctaSecondary,
  hrefSecondary = "/business/kontakt",
  mockVariant = "dashboard",
  mockDevice = "laptop",
}: {
  title: string;
  text: string;
  cta: string;
  href?: string;
  ctaSecondary?: string;
  hrefSecondary?: string;
  mockVariant?: MockVariant;
  mockDevice?: DeviceVariant;
}) {
  return (
    <section className="relative overflow-hidden bg-gray-950 py-20 text-white md:py-28" data-export="premium-cta">
      <GradientOrbs variant="dark" />
      <div className="container relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C853]/30 bg-[#00C853]/10 px-3 py-1 text-xs font-semibold text-[#00C853]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Ihr nächstes Projekt
          </div>
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold text-balance md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-pretty text-white/70">{text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={href}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00C853] px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-[#00C853]/25 transition hover:bg-[#00b34a] hover:gap-3 sm:w-auto"
            >
              {cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            {ctaSecondary ? (
              <a
                href={hrefSecondary}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:w-auto"
              >
                {ctaSecondary}
              </a>
            ) : null}
          </div>
        </div>
        <div className="relative flex justify-center lg:justify-end">
          <ProductMockupFrame
            device={mockDevice}
            presentation="hero"
            fillContainer={mockDevice !== "phone"}
            synthetic
            className={mockDevice === "phone" ? "max-w-[280px]" : "[&_figure]:shadow-2xl"}
          >
            <MockScreen variant={mockVariant} device={mockDevice === "phone" ? "phone" : "laptop"} bare showcase />
          </ProductMockupFrame>
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-[#00C853]/20 blur-2xl" aria-hidden />
        </div>
      </div>
    </section>
  );
}
