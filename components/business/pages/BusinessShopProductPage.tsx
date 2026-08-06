import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopProductVisual } from "@/components/business/shop/ShopProductVisual";
import { ShopProductFulfillmentNote } from "@/components/business/shop/ShopCategoryNoticeBox";
import { ShopTemplateStylePreviews } from "@/components/business/shop/ShopTemplateStylePreviews";
import {
  ShopProductCheckoutPanel,
  ShopProductMetaStrip,
  ShopProductProcessSteps,
  ShopProductScopeList,
  ShopRelatedProducts,
} from "@/components/business/shop/ShopProductDetailParts";
import {
  SHOP_INFRA_PARTNER_NOTE,
  SHOP_TEMPLATE_FULFILLMENT_NOTE,
} from "@/lib/constants/business-shop-category-notices";
import { productShowsStylePreviews } from "@/lib/constants/business-shop-template-previews";
import {
  getShopProduct,
  listProductsByCategory,
} from "@/lib/constants/business-shop-catalog";

type BusinessShopProductPageProps = {
  slug: string;
  source?: string | null;
};

export function BusinessShopProductPage({ slug, source }: BusinessShopProductPageProps) {
  const product = getShopProduct(slug);
  if (!product) notFound();

  const categoryProducts = listProductsByCategory(product.category);
  const isTemplate = product.type === "template";
  const isInfra = product.category === "Infrastruktur";

  return (
    <>
      <div className="border-b border-gray-200 bg-gray-100">
        <div className="container mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 text-sm text-gray-500">
          <Link href="/business/shop" className="transition hover:text-gray-900">
            Shop
          </Link>
          <span aria-hidden>/</span>
          <span className="text-gray-700">{product.category}</span>
          <span aria-hidden>/</span>
          <span className="truncate font-medium text-gray-900">{product.name}</span>
        </div>
      </div>

      <section className="bg-gray-100 pb-8 pt-5">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-6">
            <div className="min-w-0 space-y-4">
              {isTemplate ? (
                <ShopProductVisual product={product} variant="hero" />
              ) : null}

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
                <div className="flex items-start gap-3">
                  {!isTemplate ? (
                    <div className="flex shrink-0 items-center justify-center rounded-lg bg-gray-50 px-3 py-3">
                      <ShopProductVisual product={product} variant="icon-header" />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                      {isTemplate ? "Templates Business Core" : product.category}
                    </p>
                    <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 md:text-2xl">
                      {product.name}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {product.shortDescription}
                    </p>
                    {product.longDescription ? (
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        {product.longDescription}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4">
                  <ShopProductMetaStrip product={product} />
                </div>
              </div>

              {isTemplate ? (
                <ShopProductFulfillmentNote
                  title="So funktioniert's"
                  body={SHOP_TEMPLATE_FULFILLMENT_NOTE}
                />
              ) : null}

              {isInfra ? (
                <ShopProductFulfillmentNote
                  title="Partner & Automatisierung"
                  body={SHOP_INFRA_PARTNER_NOTE}
                />
              ) : null}

              {productShowsStylePreviews(product.slug) ? (
                <ShopTemplateStylePreviews productSlug={product.slug} />
              ) : null}

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
                <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-gray-900">
                  Leistungsumfang
                </h2>
                <div className="mt-3">
                  <ShopProductScopeList highlights={product.highlights} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
                <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-gray-900">
                  Ablauf
                </h2>
                <div className="mt-3">
                  <ShopProductProcessSteps product={product} />
                </div>
              </div>

              {product.type === "analyse" ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-gray-800">
                  <strong className="text-gray-900">Nach der Zahlung:</strong> Persönlicher Link zum
                  Analyse-Formular — Bericht wird digital übermittelt.
                </div>
              ) : null}

              <ShopRelatedProducts products={categoryProducts} currentSlug={product.slug} />
            </div>

            <div className="lg:sticky lg:top-24">
              <ShopProductCheckoutPanel product={product} source={source} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
