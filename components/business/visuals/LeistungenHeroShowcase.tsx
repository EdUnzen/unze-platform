"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { BusinessShowcaseCard } from "@/components/business/BusinessUi";
import { AppPhoneShowcaseTile } from "@/components/business/visuals/AppPhoneCollageShowcase";
import { CONNECT_PLATFORM_SHOWCASE } from "@/lib/constants/business-connect-showcase";
import { ReferenceBrowserShowcase } from "@/components/business/visuals/ReferenceShowcase";
import { BUSINESS_VISUAL } from "@/lib/constants/business-visual-tokens";
import { LEISTUNG_REFERENCE_SHOWCASE } from "@/lib/constants/business-reference-showcase";

function LeistungVisual({
  item,
  priority,
}: {
  item: (typeof LEISTUNG_REFERENCE_SHOWCASE)[number];
  priority?: boolean;
}) {
  if (item.id === "apps") {
    return (
      <div className="flex justify-center py-2">
        <div className="w-full max-w-[248px]">
          <AppPhoneShowcaseTile item={CONNECT_PLATFORM_SHOWCASE[1]} priority={priority} showLabels={false} />
        </div>
      </div>
    );
  }

  if ("asset" in item && item.asset) {
    return (
      <ReferenceBrowserShowcase
        asset={item.asset}
        label={item.title}
        caption={item.caption}
        size="hero"
        priority={priority}
      />
    );
  }

  return (
    <ReferenceBrowserShowcase mock={item.mock!} label={item.title} caption={item.caption} size="hero" />
  );
}

/** Leistungen — jede Referenz in einer weichen Karte */
export function LeistungenHeroShowcase() {
  return (
    <section className="border-b border-gray-100 bg-gray-50 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        <div className={`mx-auto max-w-2xl text-center ${BUSINESS_VISUAL.sectionIntroMb}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00C853]">
            Referenz in der Praxis
          </p>
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-balance text-gray-900 md:text-4xl">
            Entwickelte Lösungen — nicht nur Konzepte
          </h2>
          <p className="mt-5 text-base leading-relaxed text-pretty text-gray-600 md:text-lg">
            Jede Leistung zeigt ein anderes Projekt — nicht die Navigation dieser Website.
          </p>
        </div>

        <div className={BUSINESS_VISUAL.showcaseStack}>
          {LEISTUNG_REFERENCE_SHOWCASE.map((item, index) => (
            <BusinessScrollReveal key={item.id} delay={index * 30}>
              <BusinessShowcaseCard>
                <article
                  className={`${BUSINESS_VISUAL.featureGrid} ${
                    index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="space-y-6 lg:max-w-md lg:py-2">
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-balance text-gray-900 md:text-3xl">
                        {item.title}
                      </h3>
                      <p className="mt-5 leading-relaxed text-gray-600">{item.caption}</p>
                    </div>
                    <ul className="space-y-3">
                      {item.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C853]" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#00C853] hover:underline"
                    >
                      Leistung entdecken
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                  <div className="max-lg:mt-8 lg:pt-2">
                    <LeistungVisual item={item} priority={index === 0} />
                  </div>
                </article>
              </BusinessShowcaseCard>
            </BusinessScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
