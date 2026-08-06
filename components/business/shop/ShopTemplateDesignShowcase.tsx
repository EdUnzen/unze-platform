import Link from "next/link";

import { ShopTbcScreenshot } from "@/components/business/shop/ShopTbcScreenshot";

import {
  TBC_TEMPLATE_ORDER,
  TBC_TEMPLATES,
} from "@/lib/constants/business-core-template-screenshots";

import { ExternalLink } from "lucide-react";

/** Kompakte Musterbeispiele — alle 4 TBC-Templates */
const SHOWCASE_TEMPLATES = TBC_TEMPLATE_ORDER;

export function ShopTemplateDesignShowcase() {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            Musterbeispiele · Templates Business Core
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-base font-bold text-gray-900 md:text-lg">
            Stilrichtung wählen — UNZE erstellt Ihr individuelles Design
          </h3>
          <p className="mt-1.5 text-sm text-gray-600">
            Referenz-Layouts aus dem Designstudio. Nach der Buchung: Briefing mit Inhalten & Wunsch-Look.
          </p>
        </div>
        <Link
          href="/business/webseiten"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-700 transition hover:text-gray-900"
        >
          Mehr zu Webseiten
          <ExternalLink className="h-3 w-3" aria-hidden />
        </Link>
      </div>

      <p className="text-xs text-gray-500">
        Projektpreise ab 390 € —{" "}
        <Link href="/business/preise" className="font-semibold text-gray-700 hover:underline">
          Preisübersicht
        </Link>
        {" · "}
        <Link href="/business/kontakt" className="font-semibold text-gray-700 hover:underline">
          Anfrage stellen
        </Link>
      </p>

      <ul className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory">
        {SHOWCASE_TEMPLATES.map((id) => {
          const template = TBC_TEMPLATES[id];
          return (
            <li key={id} className="w-[min(72vw,220px)] shrink-0 snap-start sm:w-[240px]">
              <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <span className="absolute left-2 top-2 z-10 rounded-full bg-gray-900/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  Musterbeispiel
                </span>
                <ShopTbcScreenshot templateId={id} page="home" variant="gallery" />
                <div className="border-t border-gray-100 px-3 py-2">
                  <p className="truncate text-xs font-semibold text-gray-900">{template.company}</p>
                  <p className="truncate text-[10px] text-gray-500">{template.label}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
