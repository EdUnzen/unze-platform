import type { ShopProduct } from "@/lib/constants/business-shop-catalog";
import {
  WEBSITE_TEMPLATE_SHOWCASE,
  WEBSITE_TEMPLATES,
  type WebsitePageId,
  type WebsiteTemplateId,
} from "@/lib/constants/business-website-templates";

/** Referenz zu Templates Business Core (`Desktop/Templates Business Core/01_Templates/`) */
export const TBC_TEMPLATE_REFERENCES: Record<
  WebsiteTemplateId,
  { folder: string; brand: string; description: string }
> = {
  umzug: {
    folder: "01_Templates/umzug",
    brand: "TransWerk Umzug",
    description: "Referenz-Template Umzugsunternehmen",
  },
  reinigung: {
    folder: "01_Templates/reinigung",
    brand: "Glanzwerk Reinigung",
    description: "Referenz-Template Reinigung & Hausmeister",
  },
  arztpraxis: {
    folder: "01_Templates/arztpraxis",
    brand: "Praxis am Rhein MVZ",
    description: "Referenz-Template Arztpraxis",
  },
};

export type ShopTbcTemplatePreview = {
  id: WebsiteTemplateId;
  label: string;
  company: string;
  page: WebsitePageId;
  pageLabel: string;
  tbcFolder: string;
  exampleHref: string;
};

/** Echte Business-Core-Webseiten-Vorschau — dieselben Templates wie in der Werkstatt */
export const SHOP_TBC_WEBSITE_PREVIEWS: ShopTbcTemplatePreview[] = WEBSITE_TEMPLATE_SHOWCASE.map(
  (entry) => {
    const template = WEBSITE_TEMPLATES[entry.id];
    const tbc = TBC_TEMPLATE_REFERENCES[entry.id];
    return {
      id: entry.id,
      label: template.label,
      company: template.company,
      page: "home" as const,
      pageLabel: "Startseite",
      tbcFolder: tbc.folder,
      exampleHref: "/business/webseiten",
    };
  },
);

const STYLE_PREVIEW_SLUGS = new Set([
  "template-landingpage",
  "template-business-website",
  "template-website-admin",
  "template-webapp",
  "einrichtung-template-standard",
  "einrichtung-template-pro",
]);

export function productShowsStylePreviews(slug: string): boolean {
  return STYLE_PREVIEW_SLUGS.has(slug);
}

export function getTbcPreviewsForProduct(slug: string): ShopTbcTemplatePreview[] {
  if (!productShowsStylePreviews(slug)) return [];

  if (slug === "template-landingpage") {
    return [SHOP_TBC_WEBSITE_PREVIEWS.find((p) => p.id === "umzug")!];
  }

  if (slug === "template-business-website") {
    return SHOP_TBC_WEBSITE_PREVIEWS.map((p) =>
      p.id === "reinigung" ? { ...p, page: "services" as const, pageLabel: "Leistungen" } : p,
    );
  }

  if (slug === "template-webapp") {
    return SHOP_TBC_WEBSITE_PREVIEWS.slice(0, 2);
  }

  return SHOP_TBC_WEBSITE_PREVIEWS;
}

/** Thumbnail in Produktkarte — welches TBC-Template gezeigt wird */
export function getTemplatePreviewIndustry(product: ShopProduct): WebsiteTemplateId {
  switch (product.slug) {
    case "template-business-website":
    case "template-modul-bewertungen":
      return "reinigung";
    case "template-website-admin":
    case "template-modul-termin":
      return "arztpraxis";
    default:
      return "umzug";
  }
}

export function isWebAppTemplateProduct(slug: string): boolean {
  return slug === "template-webapp";
}
