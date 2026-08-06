import Link from "next/link";
import { getShopProduct } from "@/lib/constants/business-shop-catalog";
import { SHOP_FEATURED_SLUGS } from "@/lib/constants/business-shop-visuals";
import { ArrowRight, BarChart3, Check, Crown, Sparkles, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TIER_META: Record<
  string,
  { label: string; icon: LucideIcon; accent: string; ring: string; btn: string }
> = {
  "analyse-quick": {
    label: "Quick",
    icon: Zap,
    accent: "from-emerald-500/10 to-teal-500/5",
    ring: "border-gray-200 hover:border-emerald-200",
    btn: "border border-gray-200 bg-white text-gray-900 hover:border-gray-300",
  },
  "analyse-business": {
    label: "Business",
    icon: BarChart3,
    accent: "from-[#00C853]/15 to-emerald-500/5",
    ring: "border-[#00C853] shadow-lg shadow-[#00C853]/10 ring-1 ring-[#00C853]/20",
    btn: "bg-[#00C853] text-white shadow-md shadow-[#00C853]/20 hover:bg-[#00b34a]",
  },
  "analyse-premium": {
    label: "Premium",
    icon: Crown,
    accent: "from-gray-900/5 to-slate-500/5",
    ring: "border-gray-200 hover:border-gray-300",
    btn: "border border-gray-200 bg-white text-gray-900 hover:border-gray-300",
  },
};

export function ShopAnalyseTierCards() {
  const products = SHOP_FEATURED_SLUGS.map((slug) => getShopProduct(slug)).filter(Boolean);

  return (
    <section id="shop-analyse" className="scroll-mt-36 bg-white py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00C853]/10">
                <BarChart3 className="h-5 w-5 text-[#00C853]" aria-hidden />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                Analyse & Strategie
              </p>
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
              Klarheit vor der Investition
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
              Strukturierte Unternehmensanalyse — vom schnellen Website-Check bis zur persönlichen
              Strategieberatung.
            </p>
          </div>
          <Link
            href="/business/analyse"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00C853] hover:underline"
          >
            Mehr zur Analyse
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {products.map((product) => {
            if (!product) return null;
            const meta = TIER_META[product.slug] ?? TIER_META["analyse-quick"];
            const Icon = meta.icon;
            const isRecommended = product.slug === "analyse-business";

            return (
              <li key={product.id} className="relative">
                {isRecommended ? (
                  <span className="absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#00C853] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    Empfohlen
                  </span>
                ) : null}
                <article
                  className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg ${meta.ring}`}
                >
                  <div className={`bg-gradient-to-br px-6 pb-4 pt-6 ${meta.accent}`}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                      <Icon className="h-5 w-5 text-gray-800" aria-hidden />
                    </div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {meta.label}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
                      {product.priceLabel}
                    </p>
                    {product.priceNote ? (
                      <p className="mt-1 text-xs font-medium text-emerald-700">{product.priceNote}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col px-6 pb-6 pt-4">
                    <p className="text-sm leading-relaxed text-gray-600">{product.shortDescription}</p>
                    <ul className="mt-4 flex-1 space-y-2">
                      {product.highlights.slice(0, 3).map((item) => (
                        <li key={item} className="flex gap-2 text-xs text-gray-600">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00C853]" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-[11px] text-gray-400">{product.processingTime}</p>
                    <Link
                      href={`/business/shop/${product.slug}`}
                      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${meta.btn}`}
                    >
                      Jetzt buchen
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
