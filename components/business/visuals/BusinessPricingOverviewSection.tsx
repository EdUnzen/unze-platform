import { FileCode2, ShieldCheck, Sparkles } from "lucide-react";
import { BusinessEyebrow, BusinessSection } from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";
import { PRICING_WORLDS } from "@/lib/constants/business-pricing";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";

const WORLD_ICONS = {
  file: FileCode2,
  sparkles: Sparkles,
  shield: ShieldCheck,
} as const;

export function BusinessPricingOverviewSection() {
  return (
    <BusinessSection className="bg-white py-14 md:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <BusinessScrollReveal>
          <BusinessEyebrow>Drei Preiswelten</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 md:text-4xl">
            Klar getrennt — fair kommuniziert
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
            Template-Dateien sind günstig — weil Sie alles selbst einrichten. Werkstatt-Setup nutzt unser Designsystem
            — schneller, planbarer, mit Abnahme durch UNZE.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {PRICING_WORLDS.map((world) => {
              const Icon = WORLD_ICONS[world.icon];
              return (
                <div
                  key={world.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00C853]/10 text-[#00C853]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{world.title}</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                    {world.from}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">{world.detail}</p>
                </div>
              );
            })}
          </div>
        </BusinessScrollReveal>

        <BusinessScrollReveal delay={80}>
          <div className="relative min-h-[320px] overflow-hidden rounded-3xl shadow-lg lg:min-h-[380px]">
            <BusinessPhoto
              src={BUSINESS_IMAGERY.services.webseiten.src}
              alt="Professionelle Webseite und klare Preisstruktur"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-gray-950/20 to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 text-sm font-medium leading-relaxed text-white/90">
              Marktrealistische Einstiegspreise — ohne versteckte Massenware-Versprechen.
            </p>
          </div>
        </BusinessScrollReveal>
      </div>
    </BusinessSection>
  );
}
