import Link from "next/link";
import { shopSlugToInquiryHref } from "@/lib/business/inquiry-links";
import { ArrowRight, Check, X } from "lucide-react";
import {
  BusinessEyebrow,
  BusinessPageHero,
  BusinessSection,
} from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { PremiumCta } from "@/components/business/visuals/PremiumCta";
import { ServiceFlowWow } from "@/components/business/visuals/WowMoments";
import { ServicepaketeHeroVisual } from "@/components/business/visuals/ServicepaketeHeroVisual";
import { ServicePackageHoursTable } from "@/components/business/shop/ServicePackageHoursTable";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import { ENTERPRISE_SERVICE_BENEFITS } from "@/lib/constants/business-pricing";
import { SERVICE_PACKAGE_TIERS } from "@/lib/constants/business-service-package-tiers";
import { SERVICE_PRICING_MODEL } from "@/lib/constants/business-service-pricing";

export function BusinessServicepaketePage() {
  const c = BUSINESS_COPY.servicepakete;
  const cmp = c.comparison;

  return (
    <>
      <BusinessPageHero {...c.hero} />
      <BusinessSection>
        <ServicepaketeHeroVisual />
        <p className="mx-auto mt-10 max-w-3xl text-center text-lg text-gray-600">{c.intro}</p>
        <div className="mt-10">
          <ServiceFlowWow />
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.pillars.map((p, i) => (
            <BusinessScrollReveal key={p.title} delay={i * 60}>
              <article className="h-full rounded-2xl border border-gray-100 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 hover:ring-[#00C853]/20">
                <h3 className="font-semibold text-gray-900">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{p.text}</p>
              </article>
            </BusinessScrollReveal>
          ))}
        </div>
      </BusinessSection>

      <BusinessSection className="bg-gray-50">
        <div className="mx-auto max-w-2xl text-center">
          <BusinessEyebrow>{cmp.eyebrow}</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
            {cmp.title}
          </h2>
          <p className="mt-4 text-sm text-gray-600">{cmp.projectNote}</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-[#00C853]/30 bg-white p-6 shadow-sm">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">
              {cmp.withPaket.title}
            </h3>
            <ul className="mt-4 space-y-2">
              {cmp.withPaket.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-gray-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">
              {cmp.withoutPaket.title}
            </h3>
            <ul className="mt-4 space-y-2">
              {cmp.withoutPaket.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-gray-700">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-gray-500">
          {SERVICE_PRICING_MODEL.note}
        </p>
      </BusinessSection>

      <BusinessSection>
        <div className="mx-auto max-w-2xl text-center">
          <BusinessEyebrow>Pakete & Leistungen</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
            Inklusiv-Stunden & Paket-Rabatt — transparent
          </h2>
        </div>
        <div className="mx-auto mt-8 max-w-4xl">
          <ServicePackageHoursTable />
        </div>
      </BusinessSection>

      <BusinessSection className="border-y border-gray-100 bg-gradient-to-b from-white via-gray-50/50 to-white">
        <div className="mx-auto max-w-2xl text-center">
          <BusinessEyebrow>Service-Stufen</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
            Basis · Business · Premium · Enterprise
          </h2>
          <p className="mt-4 text-gray-600">
            Wählen Sie die Betreuung, die zu Ihrem Unternehmen passt — von gelegentlichem Support bis Enterprise-Priorität.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {SERVICE_PACKAGE_TIERS.map((tier, i) => {
            const copyTier = c.tiers[i];
            return (
              <BusinessScrollReveal key={tier.id} delay={i * 80}>
                <article
                  className={`flex h-full flex-col rounded-2xl border p-6 transition duration-300 hover:shadow-xl md:p-7 ${
                    tier.highlighted
                      ? "relative border-[#00C853] bg-white shadow-xl ring-2 ring-[#00C853]/15"
                      : "border-gray-100 bg-white shadow-sm"
                  }`}
                >
                  {tier.highlighted ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00C853] px-3 py-0.5 text-xs font-semibold text-white">
                      Empfohlen
                    </span>
                  ) : null}
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">{tier.name}</h3>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                    {tier.priceLabel}
                    <span className="text-sm font-normal text-gray-500"> / Monat</span>
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#007a3d]">{tier.includedHoursLabel}</p>
                  <p className="text-sm text-gray-600">{tier.discountLabel}</p>
                  {copyTier ? (
                    <p className="mt-2 text-sm text-gray-600">{copyTier.description}</p>
                  ) : null}
                  {copyTier ? (
                    <ul className="mt-4 flex-1 space-y-2">
                      {copyTier.benefits.map((b) => (
                        <li key={b} className="flex gap-2 text-sm text-gray-700">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-6">
                    <Link
                      href={shopSlugToInquiryHref(tier.slug)}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                        tier.highlighted
                          ? "bg-[#00C853] text-white hover:bg-[#00b34a]"
                          : "border border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                      }`}
                    >
                      Paket anfragen
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </article>
              </BusinessScrollReveal>
            );
          })}
        </div>
      </BusinessSection>

      <BusinessSection>
        <div
          className="rounded-3xl border border-[#00C853]/20 bg-gradient-to-br from-gray-950 to-gray-900 p-8 text-white md:p-12"
          data-export="enterprise-service"
        >
          <BusinessEyebrow>Enterprise Service</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl">
            Premium-Vorteile für Enterprise-Kunden
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {ENTERPRISE_SERVICE_BENEFITS.map((b) => (
              <li key={b} className="flex gap-3 text-sm text-white/80">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-white/55">{c.hostingNote}</p>
        </div>
      </BusinessSection>

      <PremiumCta
        title="Managed Service für Ihre Software?"
        text="Wir kümmern uns um Hosting-Setup, Updates, Support und Weiterentwicklung — damit Sie sich auf Ihr Geschäft konzentrieren können."
        cta="Servicepaket anfragen"
        mockVariant="calendar"
      />
    </>
  );
}
