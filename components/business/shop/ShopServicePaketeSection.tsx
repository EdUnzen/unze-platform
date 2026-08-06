import Link from "next/link";
import { ServicePackageHoursTable } from "@/components/business/shop/ServicePackageHoursTable";
import { getShopProduct } from "@/lib/constants/business-shop-catalog";
import { SERVICE_PACKAGE_TIERS } from "@/lib/constants/business-service-package-tiers";
import {
  ArrowRight,
  Building2,
  Check,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TIER_ICONS: Record<string, LucideIcon> = {
  basis: Shield,
  business: Star,
  premium: Sparkles,
  enterprise: Building2,
};

export function ShopServicePaketeSection() {
  return (
    <section id="shop-service" className="scroll-mt-36 border-t border-gray-100 bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00C853]/10">
                <Shield className="h-5 w-5 text-[#00C853]" aria-hidden />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                Service & Betreuung
              </p>
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
              Servicepakete — planbar und professionell
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
              Wartung, Updates und Änderungen inklusive Paket-Rabatt. Je höher das Paket, desto mehr
              Inklusiv-Leistungen.
            </p>
          </div>
          <Link
            href="/business/servicepakete"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00C853] hover:underline"
          >
            Alle Details
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {SERVICE_PACKAGE_TIERS.map((tier) => {
            const product = getShopProduct(tier.slug);
            const Icon = TIER_ICONS[tier.id] ?? Shield;
            const highlights = product?.highlights ?? [];

            return (
              <li key={tier.id} className="relative">
                {tier.highlighted ? (
                  <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#00C853] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Empfohlen
                  </span>
                ) : null}
                <article
                  className={`flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                    tier.highlighted
                      ? "border-[#00C853] ring-1 ring-[#00C853]/20"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
                    <Icon className="h-5 w-5 text-gray-700" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">
                    {tier.name}
                  </h3>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
                    {tier.priceLabel}
                    <span className="text-sm font-normal text-gray-500"> / Monat</span>
                  </p>
                  <p className="mt-2 text-xs font-medium text-[#007a3d]">{tier.includedHoursLabel}</p>
                  <p className="mt-1 text-xs text-gray-500">{tier.discountLabel}</p>
                  {highlights.length > 0 ? (
                    <ul className="mt-4 flex-1 space-y-1.5">
                      {highlights.slice(0, 3).map((item) => (
                        <li key={item} className="flex gap-2 text-xs text-gray-600">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00C853]" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Link
                    href={`/business/shop/${tier.slug}`}
                    className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      tier.highlighted
                        ? "bg-[#00C853] text-white hover:bg-[#00b34a]"
                        : "border border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    Paket buchen
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>

        <div id="shop-vergleich" className="scroll-mt-36 mt-12">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">
            Paketvergleich auf einen Blick
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Inklusiv-Leistungen und Rabatt — verbindliche Konditionen im Vertrag.
          </p>
          <div className="mt-4">
            <ServicePackageHoursTable />
          </div>
        </div>
      </div>
    </section>
  );
}
