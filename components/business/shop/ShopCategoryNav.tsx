"use client";

import { PUBLIC_SHOP_CATEGORIES } from "@/lib/constants/business-shop-catalog";
import { SHOP_CATEGORY_META, type ShopCategoryId } from "@/lib/constants/business-shop-visuals";

export function ShopCategoryNav() {
  return (
    <nav
      className="sticky top-[6.75rem] z-30 -mx-4 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-md md:top-[6.75rem]"
      aria-label="Shop-Kategorien"
    >
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PUBLIC_SHOP_CATEGORIES.map((cat) => {
          const meta = SHOP_CATEGORY_META[cat as ShopCategoryId];
          if (!meta) return null;
          return (
            <a
              key={cat}
              href={`#${meta.anchor}`}
              className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-[#00C853]/40 hover:bg-[#00C853]/5 hover:text-[#007a3d]"
            >
              {cat}
            </a>
          );
        })}
      </div>
    </nav>
  );
}