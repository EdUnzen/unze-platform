import {
  getShopCategoryMeta,
  SHOP_CATEGORY_GRADIENT,
  type ShopCategoryId,
} from "@/lib/constants/business-shop-visuals";

type ShopCategoryHeaderProps = {
  category: ShopCategoryId;
};

/** Kategorie-Kopf — weicher Verlauf, kein Kachel-Raster */
export function ShopCategoryHeader({ category }: ShopCategoryHeaderProps) {
  const meta = getShopCategoryMeta(category);
  if (!meta) return null;

  const Icon = meta.icon;
  const gradient = SHOP_CATEGORY_GRADIENT[category];

  return (
    <div
      className={`relative mb-5 overflow-hidden rounded-xl bg-gradient-to-r ${gradient} px-4 py-4 md:px-5 md:py-5`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 left-1/3 h-20 w-20 rounded-full bg-black/15 blur-xl" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
          <Icon className="h-5 w-5 text-white" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-white md:text-xl">
            {meta.title}
          </h2>
          <p className="mt-0.5 text-xs text-white/75 md:text-sm">{meta.description}</p>
        </div>
      </div>
    </div>
  );
}
