import type { ShopProduct } from "@/lib/constants/business-shop-catalog";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Calendar,
  Cloud,
  Cookie,
  CreditCard,
  Database,
  FileCode2,
  Globe,
  HardDrive,
  Layers,
  Lock,
  Mail,
  MessageCircle,
  Network,
  Plug,
  Server,
  Shield,
  Star,
  Wrench,
  Zap,
} from "lucide-react";

export const SHOP_PRODUCT_ICONS: Record<string, LucideIcon> = {
  "domain-einrichtung": Globe,
  "domain-umzug": ArrowLeftRight,
  "dns-konfiguration": Network,
  "hosting-einrichtung": Cloud,
  "email-einrichtung": Mail,
  "google-workspace-einrichtung": Mail,
  "supabase-einrichtung": Database,
  "vercel-einrichtung": Zap,
  "datenbank-grundkonfiguration": Database,
  "backup-konfiguration": HardDrive,
  monitoring: Activity,
  "ssl-konfiguration": Lock,
  "domain-registrierung-service": Globe,
  "bundle-domain-hosting": Server,
  "stripe-einrichtung": CreditCard,
  "api-anbindung": Plug,
  "whatsapp-integration": MessageCircle,
  "newsletter-anbindung": Mail,
  "kalender-buchungssystem": Calendar,
  "seo-basis-setup": BarChart3,
  "impressum-datenschutz-setup": BookOpen,
  "cookie-consent-setup": Cookie,
  "performance-optimierung": Zap,
  "einrichtung-template-standard": Layers,
  "einrichtung-template-pro": Wrench,
  "cms-wordpress-migration": FileCode2,
  "technische-beratung-stunde": MessageCircle,
  "wartung-einmal-check": Shield,
  "servicepaket-basis": Shield,
  "servicepaket-business": Shield,
  "servicepaket-premium": Star,
  "template-modul-bewertungen": Star,
  "template-modul-termin": Calendar,
};

export type ShopProductDisplayMode = "template-preview" | "icon" | "photo";

export function getShopProductDisplayMode(product: ShopProduct): ShopProductDisplayMode {
  if (product.type === "template") return "template-preview";
  if (product.type === "analyse") return "photo";
  if (product.category === "Beratung") return "photo";
  return "icon";
}

export function getShopProductSymbol(product: ShopProduct): LucideIcon {
  return SHOP_PRODUCT_ICONS[product.slug] ?? Server;
}

export function isTemplateLayout(product: ShopProduct): boolean {
  return product.type === "template";
}
