import type { ShopCategoryId } from "@/lib/constants/business-shop-visuals";

export type ShopCategoryNotice = {
  title: string;
  body: string;
};

export const SHOP_CATEGORY_NOTICES: Partial<Record<ShopCategoryId, ShopCategoryNotice>> = {
  Templates: {
    title: "Designstudio-Einstieg — Musterbeispiele",
    body: "Referenz-Designs aus Templates Business Core. Kein Download: Stilrichtung wählen, Briefing ausfüllen, UNZE erstellt im Designsystem. Shop-Preise ≠ Projektpreise (Landing ab 390 €, Website ab 790 €).",
  },
  Infrastruktur: {
    title: "Partner & Automatisierung",
    body: "Domain, Hosting, E-Mail und SSL richten wir mit etablierten Partner-Anbietern ein. Wo es technisch sinnvoll ist, automatisieren wir — bei Sonderfällen übernehmen wir persönlich. Nach der Buchung: Briefing-Formular mit Ihren Angaben.",
  },
  Einrichtung: {
    title: "Einrichtung nach Ihren Vorgaben",
    body: "Deploy, Domain-Anbindung und Go-Live auf Basis Ihrer gebuchten Leistung. Sie liefern Zugänge und Wünsche — wir setzen um und dokumentieren den Stand.",
  },
};

export function getShopCategoryNotice(category: string): ShopCategoryNotice | undefined {
  return SHOP_CATEGORY_NOTICES[category as ShopCategoryId];
}

/** Hinweis auf Produktdetailseiten für Infrastruktur-Produkte */
export const SHOP_INFRA_PARTNER_NOTE =
  "Einrichtung über Partner-Anbieter. Nach Zahlung erhalten Sie ein Briefing — automatisierbarer Umfang wird bestätigt, Rest manuell durch UNZE Business.";

export const SHOP_TEMPLATE_FULFILLMENT_NOTE =
  "Kein Sofort-Download. Referenz: Templates Business Core (Werkstatt). Nach der Buchung Briefing — Stilrichtung, Inhalte, Wunsch-Look. Erstellung individuell im UNZE Designstudio.";
