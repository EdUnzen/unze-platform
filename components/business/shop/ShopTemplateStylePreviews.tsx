import Link from "next/link";

import { ShopConnectAppGallery } from "@/components/business/shop/ShopConnectAppGallery";
import { ShopTbcScreenshot } from "@/components/business/shop/ShopTbcScreenshot";
import { isWebAppTemplateProduct } from "@/lib/constants/business-shop-template-previews";

import {

  getTbcPreviewsForShopProduct,

  TBC_TEMPLATES,

  type TbcTemplateId,

} from "@/lib/constants/business-core-template-screenshots";

import { ExternalLink } from "lucide-react";



type ShopTemplateStylePreviewsProps = {

  productSlug: string;

};



const PREVIEW_PAGES: { id: "home" | "kontakt"; label: string }[] = [

  { id: "home", label: "Startseite" },

  { id: "kontakt", label: "Kontakt" },

];



function TemplateSection({ templateId }: { templateId: TbcTemplateId }) {

  const template = TBC_TEMPLATES[templateId];



  return (

    <section className="space-y-4">

      <div className="border-b border-gray-100 pb-3">

        <p className="text-xs font-semibold text-gray-500">{template.company}</p>

        <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-gray-900">

          {template.label}

        </h3>

        <p className="text-sm text-gray-500">{template.tagline}</p>

      </div>

      <ul className="grid gap-4 sm:grid-cols-2">

        {PREVIEW_PAGES.map((page) => (

          <li key={page.id}>

            <ShopTbcScreenshot

              templateId={templateId}

              page={page.id}

              variant="gallery"

              label={`${page.label} · ${template.company}`}

            />

          </li>

        ))}

      </ul>

    </section>

  );

}



export function ShopTemplateStylePreviews({ productSlug }: ShopTemplateStylePreviewsProps) {
  if (isWebAppTemplateProduct(productSlug)) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <ShopConnectAppGallery variant="detail" />
        <Link
          href="/business/preise"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 transition hover:text-gray-900"
        >
          Volle Web-App-Projekte ab 3.990 € — Preisübersicht
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    );
  }

  const previews = getTbcPreviewsForShopProduct(productSlug);

  if (previews.length === 0) return null;

  return (

    <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">

      <div>

        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">

          Referenz aus Templates Business Core

        </h2>

        <p className="mt-1 max-w-2xl text-sm text-gray-600">

          Echte Seiten aus dem TBC Studio — Layout, Farben und Struktur wie implementiert. Ihr Design

          wird individuell im UNZE Designstudio erstellt.

        </p>

      </div>



      <div className="space-y-10">

        {previews.map((templateId) => (

          <TemplateSection key={templateId} templateId={templateId} />

        ))}

      </div>



      <Link

        href="/business/webseiten"

        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 transition hover:text-gray-900"

      >

        Weitere Informationen zu den Webseiten-Templates

        <ExternalLink className="h-3.5 w-3.5" aria-hidden />

      </Link>

    </div>

  );

}

