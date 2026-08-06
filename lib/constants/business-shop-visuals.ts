import type { ShopProduct, ShopProductType } from "@/lib/constants/business-shop-catalog";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Database,
  FileCode2,
  Layers,
  Megaphone,
  MessageSquare,
  Plug,
  Server,
  Shield,
  Sparkles,
} from "lucide-react";

export type ShopCategoryId =
  | "Analyse"
  | "Infrastruktur"
  | "Templates"
  | "Einrichtung"
  | "Integration"
  | "Marketing"
  | "Beratung"
  | "Service";

export const SHOP_CATEGORY_GRADIENT: Record<ShopCategoryId, string> = {
  Analyse: "from-emerald-700 via-emerald-800 to-teal-950",
  Infrastruktur: "from-zinc-700 via-slate-800 to-gray-950",
  Templates: "from-slate-700 via-slate-800 to-gray-900",
  /** Indigo/Violett statt Blau-Kacheln — wirkt eher „Deploy/Migration“ als Badezimmer */
  Einrichtung: "from-indigo-700 via-violet-900 to-slate-950",
  Integration: "from-teal-700 via-cyan-900 to-slate-950",
  Marketing: "from-rose-700 via-orange-800 to-gray-950",
  Beratung: "from-amber-700 via-orange-900 to-stone-950",
  Service: "from-emerald-800 via-emerald-950 to-gray-950",
};

export interface ShopCategoryMeta {
  id: ShopCategoryId;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  anchor: string;
}

export const SHOP_CATEGORY_META: Record<ShopCategoryId, ShopCategoryMeta> = {
  Analyse: {
    id: "Analyse",
    title: "Analyse & Strategie",
    description: "Strukturierte Unternehmensanalyse — vom Quick-Check bis zur Premium-Beratung.",
    icon: BarChart3,
    accent: "from-emerald-800/90 to-teal-950/85",
    anchor: "shop-analyse",
  },
  Infrastruktur: {
    id: "Infrastruktur",
    title: "Infrastruktur & Setup",
    description: "Domain, Hosting, DNS, SSL — professionell eingerichtet und dokumentiert.",
    icon: Server,
    accent: "from-zinc-800/90 to-gray-950/90",
    anchor: "shop-infrastruktur",
  },
  Templates: {
    id: "Templates",
    title: "Websites & Designs",
    description: "Musterbeispiele im UNZE-Stil — Designstudio-Einstieg ab 39 €. Volle Projekte separat.",
    icon: FileCode2,
    accent: "from-slate-800/90 to-gray-950/90",
    anchor: "shop-templates",
  },
  Einrichtung: {
    id: "Einrichtung",
    title: "Einrichtung & Migration",
    description: "Wir übernehmen Deploy, Anpassung und Go-Live — Sie starten schneller.",
    icon: Layers,
    accent: "from-indigo-800/90 to-violet-950/90",
    anchor: "shop-einrichtung",
  },
  Integration: {
    id: "Integration",
    title: "Integrationen",
    description: "Stripe, APIs, WhatsApp, Newsletter — sauber angebunden an Ihr System.",
    icon: Plug,
    accent: "from-cyan-800/85 to-slate-950/90",
    anchor: "shop-integration",
  },
  Marketing: {
    id: "Marketing",
    title: "Marketing & Sichtbarkeit",
    description: "SEO, Performance, Cookie-Banner — technisch sauber umgesetzt.",
    icon: Megaphone,
    accent: "from-rose-800/80 to-gray-950/90",
    anchor: "shop-marketing",
  },
  Beratung: {
    id: "Beratung",
    title: "Beratung",
    description: "Gezielte Experten-Sessions — klar, protokolliert, ohne versteckte Kosten.",
    icon: MessageSquare,
    accent: "from-amber-800/85 to-stone-950/90",
    anchor: "shop-beratung",
  },
  Service: {
    id: "Service",
    title: "Service & Wartung",
    description: "Laufende Betreuung, Checks und Servicepakete — planbar monatlich.",
    icon: Shield,
    accent: "from-emerald-900/85 to-gray-950/90",
    anchor: "shop-service",
  },
};

const TYPE_ICON: Record<ShopProductType, LucideIcon> = {
  analyse: Sparkles,
  grund: Database,
  template: FileCode2,
  pauschal: Server,
  servicepaket: Shield,
};

export interface ShopProductVisualStyle {
  gradient: string;
}

export function getShopCategoryMeta(category: string): ShopCategoryMeta | undefined {
  return SHOP_CATEGORY_META[category as ShopCategoryId];
}

export function getShopProductVisual(product: ShopProduct): ShopProductVisualStyle {
  const categoryId = product.category as ShopCategoryId;
  const gradient = SHOP_CATEGORY_GRADIENT[categoryId] ?? SHOP_CATEGORY_GRADIENT.Analyse;
  return { gradient };
}

export function getShopProductIcon(product: ShopProduct): LucideIcon {
  return TYPE_ICON[product.type] ?? Sparkles;
}

export { getShopProcessSteps } from "@/lib/constants/business-shop-workflows";

export const SHOP_TRUST_ITEMS = [
  { label: "Sichere Zahlung", detail: "Stripe · verschlüsselt" },
  { label: "Bestätigung per E-Mail", detail: "Sofort nach Buchung" },
  { label: "Persönliche Bearbeitung", detail: "Durch UNZE Business" },
  { label: "Transparente Preise", detail: "Netto · klarer Scope" },
] as const;

export const SHOP_FEATURED_SLUGS = [
  "analyse-quick",
  "analyse-business",
  "analyse-premium",
] as const;
