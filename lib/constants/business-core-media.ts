import type { WebsiteTemplateId } from "@/lib/constants/business-website-templates";

/**
 * Medien aus Templates Business Core (`05_Medien/`).
 * JPG-Slots laut Manifest; SVG-Platzhalter bis KI-Bilder exportiert sind.
 */
export const BUSINESS_CORE_MEDIA: Partial<
  Record<WebsiteTemplateId, { hero?: string; heroAlt?: string }>
> = {
  reinigung: {
    hero: "/media/business-core/reinigung/hero.svg",
    heroAlt: "Glanzwerk Reinigung — professionelle Gebäudereinigung",
  },
  umzug: {
    hero: "/media/business-core/umzug/hero.svg",
    heroAlt: "TransWerk Umzug — professionelles Umzugsteam",
  },
  arztpraxis: {
    hero: "/media/business-core/arztpraxis/hero.svg",
    heroAlt: "Praxis am Rhein — moderne Arztpraxis",
  },
};

export function getBusinessCoreHeroMedia(industry: WebsiteTemplateId) {
  return BUSINESS_CORE_MEDIA[industry];
}
