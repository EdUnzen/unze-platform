import {
  BusinessEyebrow,
  BusinessSectionIntro,
  BusinessShowcaseCard,
} from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { ProductBrandPanel } from "@/components/business/visuals/ProductBrandPanel";
import { MY_ORGANIZER_AI_HERO } from "@/lib/constants/business-product-assets";
import Link from "next/link";
import { ArrowRight, FileSearch, MessageSquare, Workflow } from "lucide-react";

/** KI-Seite — Final-Logo (Bildmarke), ohne Fake-Phone-Mocks / Wordmark-Doppelung */
export function BusinessKiHeroShowcase() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-lg shadow-gray-900/5">
      <div className="relative grid items-center gap-8 p-8 md:grid-cols-[0.9fr_1.1fr] md:gap-10 md:p-12">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Eigene KI-Produkte
          </p>
          <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
            My Organizer AI
          </h3>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-pretty text-gray-600 md:text-base">
            Offizielles Produkt von UNZE Business — Original-App-Icon und echte Oberflächen.
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <ProductBrandPanel
            src={MY_ORGANIZER_AI_HERO.src}
            alt={MY_ORGANIZER_AI_HERO.alt}
            size="hero"
          />
        </div>
      </div>
    </div>
  );
}

const KI_CARDS = [
  {
    title: "Dokumente verstehen",
    text: "Scan, Strukturierung und durchsuchbare Ablage — transparent für Teams.",
    icon: FileSearch,
  },
  {
    title: "Assistenten statt Klickarbeit",
    text: "Angebote, Antworten und Workflows per natürlicher Sprache anstoßen.",
    icon: MessageSquare,
  },
  {
    title: "Prozesse verbinden",
    text: "CRM, E-Mail, WhatsApp und APIs — Automatisierung dort, wo sie entlastet.",
    icon: Workflow,
  },
] as const;

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
          {KI_CARDS.map((item, index) => (
            <BusinessScrollReveal key={item.title} delay={index * 60}>
              <BusinessShowcaseCard className="h-full !p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#00C853]">
                  <item.icon className="h-6 w-6" aria-hidden />
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
