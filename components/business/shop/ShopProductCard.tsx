import Link from "next/link";

import { ShopProductVisual } from "@/components/business/shop/ShopProductVisual";

import { isTemplateLayout } from "@/lib/constants/business-shop-product-icons";

import {

  getTbcTemplateForProduct,

  TBC_TEMPLATES,

} from "@/lib/constants/business-core-template-screenshots";

import type { ShopProduct } from "@/lib/constants/business-shop-catalog";

import { ArrowRight, Check, Clock } from "lucide-react";



type ShopProductCardProps = {

  product: ShopProduct;

};



function CardBody({ product }: { product: ShopProduct }) {
  const isTemplate = isTemplateLayout(product);

  return (

    <>

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          {!isTemplateLayout(product) ? (

            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">

              {product.category}

            </p>

          ) : null}

          <h3 className="mt-0.5 font-[family-name:var(--font-display)] text-base font-semibold leading-snug text-gray-900">

            {product.name}

          </h3>

        </div>

        <p className="shrink-0 text-base font-bold text-gray-900">{product.priceLabel}</p>

      </div>



      <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.shortDescription}</p>



      {product.priceNote ? (

        <p className="mt-1.5 text-xs font-medium text-gray-600">{product.priceNote}</p>

      ) : null}



      <ul className="mt-3 space-y-1">
        {product.highlights.slice(0, isTemplate ? 2 : 3).map((item) => (

          <li key={item} className="flex gap-2 text-xs text-gray-600">

            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />

            {item}

          </li>

        ))}

      </ul>



      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-4">

        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">

          <Clock className="h-3.5 w-3.5" aria-hidden />

          {product.processingTime}

        </span>

        <Link

          href={`/business/shop/${product.slug}`}

          className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"

        >

          Details & buchen

          <ArrowRight className="h-3.5 w-3.5" aria-hidden />

        </Link>

      </div>

    </>

  );

}



export function ShopProductCard({ product }: ShopProductCardProps) {

  const isTemplate = isTemplateLayout(product);



  if (isTemplate) {

    const templateId = getTbcTemplateForProduct(product.slug);

    const template = TBC_TEMPLATES[templateId];



    return (

      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow-md">

        <ShopProductVisual product={product} variant="card" />

        <div className="flex flex-1 flex-col p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Musterbeispiel · {template.label}
          </p>
          <CardBody product={product} />
        </div>

      </article>

    );

  }



  return (

    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow-md">

      <div className="flex items-center justify-center border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white px-4 py-5">

        <ShopProductVisual product={product} variant="icon-header" />

      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">

        <CardBody product={product} />

      </div>

    </article>

  );

}

