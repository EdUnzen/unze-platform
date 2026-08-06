import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { MockScreen } from "@/components/business/visuals/MockScreen";
import { GradientOrbs } from "@/components/business/visuals/GradientOrbs";
import { BusinessEyebrow } from "@/components/business/BusinessUi";

export function KontaktPremiumHero({
  eyebrow,
  headline,
  subline,
}: {
  eyebrow: string;
  headline: string;
  subline: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <GradientOrbs variant="kontakt" />
      <div className="container relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <BusinessEyebrow>{eyebrow}</BusinessEyebrow>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight md:text-5xl">
            {headline}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/75">{subline}</p>
          <p className="mt-6 text-sm text-white/50">
            Ihre Angaben werden strukturiert an unser Team übermittelt — für ein schnelles, persönliches Erstgespräch.
          </p>
        </div>
        <div className="relative hidden md:block" data-export="kontakt-hero-visual">
          <div className="relative z-10">
            <ProductMockupFrame device="laptop" presentation="hero" fillContainer synthetic>
              <MockScreen variant="dashboard" bare showcase />
            </ProductMockupFrame>
          </div>
          <div className="absolute -bottom-6 -right-4 z-20 w-[160px] motion-safe:animate-[float_6s_ease-in-out_infinite]">
            <ProductMockupFrame device="phone" presentation="standard" synthetic>
              <MockScreen variant="ai" device="phone" bare showcase />
            </ProductMockupFrame>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}
