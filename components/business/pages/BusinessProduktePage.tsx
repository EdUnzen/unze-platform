import Link from "next/link";
import { ArrowRight, BadgeCheck, ExternalLink } from "lucide-react";
import {
  BusinessCtaButton,
  BusinessEyebrow,
  BusinessPageHero,
  BusinessSection,
} from "@/components/business/BusinessUi";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { PremiumCta } from "@/components/business/visuals/PremiumCta";
import { OwnProductVisual } from "@/components/business/visuals/OwnProductVisual";
import {
  OWN_PRODUCTS_INTRO,
  UNZE_OWN_PRODUCTS,
  type OwnProduct,
} from "@/lib/constants/business-own-products";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";

function ProductCard({ product }: { product: OwnProduct }) {
  const isConnect = product.id === "unze-connect";

  return (
    <article
      className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
      data-export={`own-product-${product.id}`}
    >
      <div className="p-8 md:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/10">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
          {product.statusLabel}
        </span>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-balance text-gray-900 md:text-3xl">
          {product.name}
        </h2>
        <p className="mt-1 text-sm font-medium text-[#00C853]">{product.tagline}</p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-pretty text-gray-600">
          {product.description}
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {product.highlights.map((h) => (
            <li
              key={h}
              className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
            >
              {h}
            </li>
          ))}
        </ul>
        {product.href ? (
          <Link
            href={product.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#00C853] hover:underline"
          >
            {product.hrefLabel ?? "Mehr erfahren"}
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
      <div className="border-t border-gray-100">
        <OwnProductVisual productId={product.id} layout="card" />
        {isConnect ? (
          <p className="border-t border-gray-100 bg-gray-50/80 px-6 py-4 text-center text-xs leading-relaxed text-pretty text-gray-500 md:px-8">
            {OWN_PRODUCTS_INTRO.connectProof}
          </p>
        ) : null}
      </div>

      {product.referenceAreas?.length ? (
        <div className="border-t border-gray-100 bg-gray-50/80 px-8 py-8 md:px-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Referenz — entwickelte Bereiche
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {product.referenceAreas.map((area) => (
              <div
                key={area.label}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-semibold text-gray-900">{area.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function BusinessProduktePage() {
  const c = BUSINESS_COPY.produkte;

  return (
    <>
      <BusinessPageHero {...c.hero} />
      <BusinessSection>
        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-gray-600">
          {OWN_PRODUCTS_INTRO.lead}
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-gray-500">
          {OWN_PRODUCTS_INTRO.referenceNote}
        </p>
      </BusinessSection>
      <BusinessSection className="bg-gray-50">
        <div className="space-y-10">
          {UNZE_OWN_PRODUCTS.map((product, i) => (
            <BusinessScrollReveal key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </BusinessScrollReveal>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-gray-800">{c.futureNote}</p>
        </div>
      </BusinessSection>
      <BusinessSection>
        <div className="rounded-3xl bg-gray-950 px-8 py-10 text-white md:px-12">
          <BusinessEyebrow>{c.leistungenBridge.eyebrow}</BusinessEyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-balance md:text-3xl">
            {c.leistungenBridge.title}
          </h2>
          <p className="mt-4 max-w-2xl text-white/70">{c.leistungenBridge.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BusinessCtaButton href="/business/business-core" variant="primary">
              Business Core
            </BusinessCtaButton>
            <Link
              href="/business/leistungen"
              className="inline-flex items-center gap-1 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Alle Leistungen
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </BusinessSection>
      <PremiumCta
        title={c.cta.title}
        text={c.cta.text}
        cta={c.cta.button}
        mockVariant="ai"
        mockDevice="phone"
      />
    </>
  );
}
