import Image from "next/image";
import Link from "next/link";
import { SHOP_TRUST_ITEMS } from "@/lib/constants/business-shop-visuals";
import { ArrowRight, CreditCard, Mail, ShieldCheck, Users } from "lucide-react";

const TRUST_ICONS = [ShieldCheck, CreditCard, Mail, Users] as const;

export function ShopTrustStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {SHOP_TRUST_ITEMS.map((item, i) => {
        const Icon = TRUST_ICONS[i] ?? ShieldCheck;
        return (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00C853]/10">
              <Icon className="h-4 w-4 text-[#00C853]" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900">{item.label}</p>
              <p className="text-[10px] text-gray-500">{item.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ShopHero() {
  return (
    <section className="relative overflow-hidden border-b border-gray-900/10 bg-gradient-to-br from-gray-950 via-emerald-950 to-gray-950 text-white">
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-[#00C853]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-400">
              UNZE Business · Buchung
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight md:text-4xl">
              Analyse starten oder Servicepaket wählen
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
              Klar abgegrenzt, sicher online bezahlen, persönlich bearbeitet. Projekte, Webseiten und
              Apps laufen über Analyse, Angebot und Abstimmung — nicht über den Shop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#shop-analyse"
                className="inline-flex items-center gap-2 rounded-full bg-[#00C853] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#00C853]/25 transition hover:bg-[#00b34a]"
              >
                Analyse wählen
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="#shop-service"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Servicepakete
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 shadow-2xl shadow-black/40 ring-1 ring-white/10">
              <div className="flex items-center gap-2 border-b border-white/10 bg-gray-900/80 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 truncate text-[10px] text-white/40">unze.app/business/shop</span>
              </div>
              <div className="relative aspect-[16/10] bg-gray-800">
                <Image
                  src="/media/showcase/connect/dashboard.png"
                  alt="UNZE Plattform — Referenz für professionelle Betreuung"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="object-contain object-center"
                />
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-white/45">
              Professionelle Plattform-Betreuung — Ihr System, unsere Verantwortung
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <ShopTrustStrip />
        </div>
      </div>
    </section>
  );
}
