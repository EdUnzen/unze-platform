import { ShopAnalyseTierCards } from "@/components/business/shop/ShopAnalyseTierCards";
import { ShopHero } from "@/components/business/shop/ShopHero";
import { ShopPageNav } from "@/components/business/shop/ShopPageNav";
import { ShopServicePaketeSection } from "@/components/business/shop/ShopServicePaketeSection";
import { listPurchasableProducts } from "@/lib/constants/business-shop-catalog";
import Link from "next/link";
import { ArrowRight, Layers, MessageCircle } from "lucide-react";

/** Schlanker Checkout — Analyse + Servicepakete, visuell aufbereitet */
export function BusinessShopPage() {
  const products = listPurchasableProducts();

  return (
    <>
      <ShopHero />
      <ShopPageNav />

      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-5">
          <div className="flex flex-wrap items-start gap-4 rounded-xl border border-gray-100 bg-gray-50/80 px-5 py-4 md:gap-8">
            <div className="flex min-w-[200px] flex-1 items-start gap-3">
              <Layers className="mt-0.5 h-5 w-5 shrink-0 text-[#00C853]" aria-hidden />
              <p className="text-sm leading-relaxed text-gray-700">
                Der Shop ist für <strong className="font-semibold text-gray-900">Analyse</strong> und{" "}
                <strong className="font-semibold text-gray-900">Servicepakete</strong>. Webseiten, Apps
                und Einrichtung laufen über{" "}
                <Link href="/business/leistungen" className="font-semibold text-[#00C853] hover:underline">
                  Leistungen
                </Link>{" "}
                und persönliches Angebot.
              </p>
            </div>
            <Link
              href="/business/kontakt"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:border-[#00C853]/30"
            >
              <MessageCircle className="h-4 w-4 text-[#00C853]" aria-hidden />
              Projekt anfragen
            </Link>
          </div>
        </div>
      </div>

      <ShopAnalyseTierCards />
      <ShopServicePaketeSection />

      <section className="border-t border-gray-100 bg-gray-950 py-12 text-white md:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl">
              Größeres Projekt geplant?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
              Webseiten, Apps und Business Core — individuelles Angebot nach Analyse. Orientierungspreise
              auf{" "}
              <Link href="/business/preise" className="text-[#00C853] hover:underline">
                /business/preise
              </Link>
              .
            </p>
            <Link
              href="/business/kontakt"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#00C853] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#00b34a]"
            >
              Kostenlos anfragen
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <p className="mt-6 text-xs text-white/40">
              {products.length} Leistungen · Orientierungspreise · Persönliche Bearbeitung im Studio
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
