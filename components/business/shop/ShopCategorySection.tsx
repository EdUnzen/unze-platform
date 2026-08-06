import { ShopCategoryHeader } from "@/components/business/shop/ShopCategoryHeader";
import { ShopCategoryNoticeBox } from "@/components/business/shop/ShopCategoryNoticeBox";
import { ShopProductCard } from "@/components/business/shop/ShopProductCard";
import { ShopTemplateDesignShowcase } from "@/components/business/shop/ShopTemplateDesignShowcase";
import { getShopCategoryMeta, type ShopCategoryId } from "@/lib/constants/business-shop-visuals";
import { getShopCategoryNotice } from "@/lib/constants/business-shop-category-notices";
import type { ShopProduct } from "@/lib/constants/business-shop-catalog";

type ShopCategorySectionProps = {
  category: ShopCategoryId;
  products: ShopProduct[];
};

export function ShopCategorySection({ category, products }: ShopCategorySectionProps) {
  const meta = getShopCategoryMeta(category);
  const notice = getShopCategoryNotice(category);
  if (!meta || products.length === 0) return null;

  return (
    <section id={meta.anchor} className="scroll-mt-36 border-t border-gray-100 py-8 md:py-10">
      <ShopCategoryHeader category={category} />
      {notice ? <ShopCategoryNoticeBox notice={notice} /> : null}
      {category === "Templates" ? <ShopTemplateDesignShowcase /> : null}
      <ul
        className={
          category === "Templates"
            ? "grid gap-6 sm:grid-cols-2"
            : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        {products.map((product) => (
          <li key={product.id}>
            <ShopProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
