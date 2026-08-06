/**
 * Echte Templates Business Core — Screenshots aus dem TBC Studio (Port 3100).
 * Generierung: npm run marketing:capture:tbc
 */

export type TbcTemplateId = "umzug" | "reinigung" | "hausmeister" | "arztpraxis";

export type TbcTemplatePageId = "home" | "kontakt";

export interface TbcTemplateMeta {
  id: TbcTemplateId;
  label: string;
  company: string;
  tagline: string;
  tbcRoute: string;
  tbcFolder: string;
}

export const TBC_TEMPLATES: Record<TbcTemplateId, TbcTemplateMeta> = {
  umzug: {
    id: "umzug",
    label: "Umzugsunternehmen",
    company: "TransWerk Umzug",
    tagline: "Privat- & Firmenumzüge",
    tbcRoute: "/umzug",
    tbcFolder: "01_Templates/umzug",
  },
  reinigung: {
    id: "reinigung",
    label: "Reinigung & Facility",
    company: "Glanzwerk Reinigung",
    tagline: "Reinigung, Facility & Hausmeister",
    tbcRoute: "/reinigung",
    tbcFolder: "01_Templates/reinigung",
  },
  hausmeister: {
    id: "hausmeister",
    label: "Hausmeister & Objektbetreuung",
    company: "ObjektWerk Hausmeisterservice",
    tagline: "Objektbetreuung aus einer Hand",
    tbcRoute: "/hausmeister",
    tbcFolder: "01_Templates/hausmeister",
  },
  arztpraxis: {
    id: "arztpraxis",
    label: "Arztpraxis Premium",
    company: "Praxis am Stadtpark",
    tagline: "Hausarztmedizin & MVZ",
    tbcRoute: "/arztpraxis",
    tbcFolder: "01_Templates/arztpraxis",
  },
};

export const TBC_TEMPLATE_ORDER: TbcTemplateId[] = [
  "umzug",
  "reinigung",
  "hausmeister",
  "arztpraxis",
];

export function tbcScreenshotPath(templateId: TbcTemplateId, page: TbcTemplatePageId = "home"): string {
  return `/media/business-core/screenshots/${templateId}/${page}.png`;
}

export function tbcScreenshotAlt(templateId: TbcTemplateId, page: TbcTemplatePageId = "home"): string {
  const t = TBC_TEMPLATES[templateId];
  const pageLabel = page === "home" ? "Startseite" : "Kontakt";
  return `${t.company} — ${pageLabel} (Templates Business Core)`;
}

/** Shop-Produkt → Referenz-Template aus TBC */
export function getTbcTemplateForProduct(slug: string): TbcTemplateId {
  switch (slug) {
    case "template-business-website":
    case "template-modul-bewertungen":
    case "einrichtung-template-standard":
      return "reinigung";
    case "template-website-admin":
    case "template-modul-termin":
      return "arztpraxis";
    case "template-webapp":
      return "hausmeister";
    default:
      return "umzug";
  }
}

export function getTbcPreviewsForShopProduct(slug: string): TbcTemplateId[] {
  switch (slug) {
    case "template-landingpage":
      return ["umzug"];
    case "template-business-website":
    case "einrichtung-template-standard":
    case "einrichtung-template-pro":
      return TBC_TEMPLATE_ORDER;
    case "template-webapp":
      return ["umzug", "reinigung", "hausmeister"];
    case "template-website-admin":
    case "template-modul-termin":
      return ["arztpraxis"];
    default:
      return TBC_TEMPLATE_ORDER;
  }
}
