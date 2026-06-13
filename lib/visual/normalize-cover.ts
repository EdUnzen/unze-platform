export { isUsableImageUrl } from "@/lib/visual/image-url";

import { getDefaultBannerPresetForCategory } from "@/lib/constants/category-banners";

export function normalizeBannerGradient(
  gradient: string | null | undefined,
  category: string,
): string {
  const trimmed = gradient?.trim() ?? "";
  if (trimmed.includes("from-") && trimmed.includes("to-")) {
    return trimmed;
  }
  return getDefaultBannerPresetForCategory(category).gradient;
}
