import Link from "next/link";
import { ShopProductVisual } from "@/components/business/shop/ShopProductVisual";
import { ShopProductWorkflowSteps } from "@/components/business/shop/ShopWorkflowSection";
import { ShopCheckoutForm } from "@/components/business/ShopCheckoutForm";
import type { ShopProduct } from "@/lib/constants/business-shop-catalog";
import { getShopProcessSteps, SHOP_TRUST_ITEMS } from "@/lib/constants/business-shop-visuals";
import { Check, Clock, CreditCard, Mail, ShieldCheck } from "lucide-react";

type ShopProductCheckoutPanelProps = {
  product: ShopProduct;
  source?: string | null;
};

export function ShopProductCheckoutPanel({ product, source }: ShopProductCheckoutPanelProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gray-950 text-white shadow-2xl ring-1 ring-white/10">
      <div className="border-b border-white/10 bg-gradient-to-br from-gray-900 to-gray-950 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          Jetzt buchen
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
            {product.priceLabel}
          </p>
          {product.billingInterval ? (
            <span className="text-sm text-white/50">/ Monat</span>
          ) : null}
        </div>
        {product.priceNote ? (
          <p className="mt-2 text-sm text-emerald-300">{product.priceNote}</p>
        ) : null}
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/60">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {product.processingTime}
        </p>
      </div>

      <div className="px-6 py-5">
        <ShopCheckoutForm product={product} source={source} theme="dark" />
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/5">
        {SHOP_TRUST_ITEMS.map((item) => (
          <div key={item.label} className="bg-gray-950 px-4 py-3">
            <p className="text-[11px] font-semibold text-white/90">{item.label}</p>
            <p className="mt-0.5 text-[10px] text-white/45">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type ShopProductProcessStepsProps = {
  product: ShopProduct;
};

export function ShopProductProcessSteps({ product }: ShopProductProcessStepsProps) {
  const steps = getShopProcessSteps(product);
  return <ShopProductWorkflowSteps steps={steps} />;
}

type ShopRelatedProductsProps = {
  products: ShopProduct[];
  currentSlug: string;
};

export function ShopRelatedProducts({ products, currentSlug }: ShopRelatedProductsProps) {
  const related = products.filter((p) => p.slug !== currentSlug).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <div>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">
        Weitere Leistungen in dieser Kategorie
      </h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {related.map((product) => (
          <li key={product.id}>
            <Link
              href={`/business/shop/${product.slug}`}
              className="group flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <div className="w-24 shrink-0">
                <ShopProductVisual product={product} variant="compact" className="h-full min-h-[88px]" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center p-3">
                <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-[#007a3d]">
                  {product.name}
                </p>
                <p className="mt-0.5 text-xs font-medium text-[#00C853]">{product.priceLabel}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ShopProductScopeList({ highlights }: { highlights: string[] }) {
  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
      {highlights.map((item) => (
        <li key={item} className="flex items-start gap-3 px-4 py-3.5 text-sm text-gray-700">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ShopProductMetaStrip({ product }: { product: ShopProduct }) {
  return (
    <div className="flex flex-wrap gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
        <ShieldCheck className="h-3.5 w-3.5 text-[#00C853]" aria-hidden />
        {product.category}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
        <Clock className="h-3.5 w-3.5 text-gray-400" aria-hidden />
        {product.processingTime}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
        <CreditCard className="h-3.5 w-3.5 text-gray-400" aria-hidden />
        Stripe · sicher
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
        <Mail className="h-3.5 w-3.5 text-gray-400" aria-hidden />
        E-Mail-Bestätigung
      </span>
    </div>
  );
}
