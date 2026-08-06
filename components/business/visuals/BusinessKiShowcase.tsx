import {
  BusinessEyebrow,
  BusinessSectionIntro,
  BusinessShowcaseCard,
} from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import {
  AppPhoneStageShowcase,
} from "@/components/business/visuals/AppPhoneCollageShowcase";
import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { MockScreen } from "@/components/business/visuals/MockScreen";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { ProductBrandPanel } from "@/components/business/visuals/ProductBrandPanel";
import { ORGANIZER_PHONE_SHOWCASE, MY_ORGANIZER_AI_HERO } from "@/lib/constants/business-product-assets";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

/** KI-Seite — visuell starke Hero-Darstellung mit Produktbezug */
export function BusinessKiHeroShowcase() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 shadow-2xl shadow-gray-900/20">
      <div
        className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl"
        aria-hidden
      />
      <div className="relative grid items-stretch lg:grid-cols-2">
        <div className="flex flex-col justify-center border-b border-white/10 lg:border-b-0 lg:border-r">
          <div className="p-6 md:p-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Eigene KI-Produkte
            </p>
            <div className="mt-6 flex justify-center lg:justify-start">
              <ProductBrandPanel
                src={MY_ORGANIZER_AI_HERO.src}
                alt={MY_ORGANIZER_AI_HERO.alt}
                size="hero"
                className="!bg-transparent !p-0"
              />
            </div>
            <p className="mt-6 max-w-md text-center text-sm leading-relaxed text-pretty text-white/65 lg:text-left">
              KI-Assistent aus eigener Entwicklung — Dokumente, Workflows und Entscheidungen in
              Business Core und My Organizer AI.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 md:p-8 lg:py-12">
          <AppPhoneStageShowcase items={ORGANIZER_PHONE_SHOWCASE} priorityIndex={1} />
        </div>
      </div>
    </div>
  );
}

export function BusinessKiShowcaseSection() {
  return (
    <section className="border-b border-gray-100 bg-gradient-to-b from-gray-50 via-white to-gray-50 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        <BusinessSectionIntro
          eyebrow={<BusinessEyebrow>Eigene KI-Produkte</BusinessEyebrow>}
          title="Von der Idee zur produktiven Automatisierung"
          intro="My Organizer AI und Business Core zeigen, wie wir KI praxisnah einsetzen — nicht als Buzzword, sondern als entlastende Oberfläche im Alltag."
          className={BUSINESS_VISUAL.sectionIntroMb}
        />

        <div className={`${BUSINESS_VISUAL.sectionContentMt} grid gap-8 md:grid-cols-3`}>
          {[
            {
              title: "Dokumente verstehen",
              text: "Scan, Strukturierung und durchsuchbare Ablage — transparent für Teams.",
            },
            {
              title: "Assistenten statt Klickarbeit",
              text: "Angebote, Antworten und Workflows per natürlicher Sprache anstoßen.",
            },
            {
              title: "Prozesse verbinden",
              text: "CRM, E-Mail, WhatsApp und APIs — Automatisierung dort, wo sie entlastet.",
            },
          ].map((item, index) => (
            <BusinessScrollReveal key={item.title} delay={index * 60}>
              <BusinessShowcaseCard className="h-full !p-8">
                <div className="mx-auto w-[160px]">
                  <ProductMockupFrame device="phone" presentation="card" synthetic>
                    <MockScreen
                      variant={index === 0 ? "documents" : index === 1 ? "ai" : "webapp"}
                      device="phone"
                      bare
                      showcase
                    />
                  </ProductMockupFrame>
                </div>
                <h3 className="mt-6 font-[family-name:var(--font-display)] text-lg font-semibold text-balance text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </BusinessShowcaseCard>
            </BusinessScrollReveal>
          ))}
        </div>

        <p className="mt-12 text-center">
          <Link
            href="/business/produkte"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00C853] hover:underline"
          >
            Eigene Produkte ansehen
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
