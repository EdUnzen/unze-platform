import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BusinessScrollReveal } from "@/components/business/BusinessScrollReveal";
import { OwnProductVisual } from "@/components/business/visuals/OwnProductVisual";
import type { OwnProduct } from "@/lib/constants/business-own-products";

interface BusinessProductShowcaseCardProps {
  product: OwnProduct;
  delay?: number;
}

export function BusinessProductShowcaseCard({
  product,
  delay = 0,
}: BusinessProductShowcaseCardProps) {
  return (
    <BusinessScrollReveal delay={delay}>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative min-h-[440px] overflow-hidden sm:min-h-[460px]">
          <OwnProductVisual productId={product.id} layout="compact" />
        </div>
        <div className="flex flex-1 flex-col p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#00C853]">
            {product.statusLabel}
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-balance text-gray-900">
            {product.name}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{product.description}</p>
          {product.href ? (
            <Link
              href={product.href}
              target={product.href.startsWith("http") ? "_blank" : undefined}
              rel={product.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#00C853] transition group-hover:gap-2"
            >
              {product.hrefLabel ?? "Mehr erfahren"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <Link
              href="/business/produkte"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#00C853] transition group-hover:gap-2"
            >
              Produkt ansehen
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </article>
    </BusinessScrollReveal>
  );
}
