import { ArrowRight, Sparkles } from "lucide-react";
import { BusinessLink } from "@/components/business/BusinessLink";
import { BUSINESS_NAV_SECONDARY } from "@/lib/constants/business-site";
import { MY_ORGANIZER_AI_HERO, UNZE_CONNECT_LOGO } from "@/lib/constants/business-product-assets";
import { ProductBrandPanel } from "@/components/business/visuals/ProductBrandPanel";

const SECONDARY_META = {
  "/business/ki-automatisierung": {
    title: "KI & Automatisierung",
    text: "Assistenten, Workflows und intelligente Prozesse — aus eigener Entwicklung.",
    accent: "from-violet-600/20 via-emerald-500/10 to-slate-950",
    icon: Sparkles,
  },
  "/business/produkte": {
    title: "Eigene Produkte",
    text: "UNZE Connect — eigene Plattform. My Organizer AI ist für neue Kunden nicht mehr verfügbar.",
    accent: "from-emerald-500/15 via-slate-900 to-gray-950",
    icon: null,
  },
} as const;

/** Visuell starke Footer-Navigation für KI & Produkte */
export function BusinessFooterSecondaryShowcase() {
  return (
    <section className="border-t border-gray-100 bg-white" aria-label="Weitere Leistungen">
      <div className="container mx-auto max-w-6xl px-4 py-10 md:py-12">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Mehr entdecken
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:gap-6">
          {BUSINESS_NAV_SECONDARY.map((item) => {
            const meta = SECONDARY_META[item.href as keyof typeof SECONDARY_META];
            const isKi = item.href.includes("ki-automatisierung");

            return (
              <BusinessLink
                key={item.href}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-950 shadow-lg shadow-gray-900/10 transition duration-300 hover:-translate-y-0.5 hover:border-[#00C853]/30 hover:shadow-xl"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-90`}
                  aria-hidden
                />
                <div className="relative grid min-h-[168px] grid-cols-[minmax(0,1fr)_auto] items-stretch gap-4 p-5 md:p-6">
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      {isKi && meta.icon ? (
                        <meta.icon className="h-4 w-4 text-emerald-400" aria-hidden />
                      ) : null}
                      <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                        {item.label}
                      </span>
                    </div>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-bold text-balance text-white md:text-xl">
                      {meta.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-pretty text-white/65">{meta.text}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00C853] transition group-hover:gap-2.5">
                      Ansehen
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                  <div className="hidden shrink-0 items-center justify-center gap-3 sm:flex">
                    {isKi ? (
                      <span className="opacity-60 grayscale">
                        <ProductBrandPanel
                          src={MY_ORGANIZER_AI_HERO.src}
                          alt={MY_ORGANIZER_AI_HERO.alt}
                          size="footer"
                          discontinued
                        />
                      </span>
                    ) : (
                      <>
                        <ProductBrandPanel
                          src={UNZE_CONNECT_LOGO.src}
                          alt={UNZE_CONNECT_LOGO.alt}
                          size="footer"
                        />
                        <span className="opacity-60 grayscale">
                          <ProductBrandPanel
                            src={MY_ORGANIZER_AI_HERO.src}
                            alt={MY_ORGANIZER_AI_HERO.alt}
                            size="footer"
                            discontinued
                          />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </BusinessLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
