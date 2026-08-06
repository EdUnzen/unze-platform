import type { ShopProduct } from "@/lib/constants/business-shop-catalog";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";
import type { ShopCategoryId } from "@/lib/constants/business-shop-visuals";

/** Quadrat-Thumbnails — semantisch pro Leistung */
const img = (id: string, size = 400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${size}&h=${size}&q=82`;

export type ShopProductImage = { src: string; alt: string };

const CATEGORY_FALLBACK: Record<ShopCategoryId, ShopProductImage> = {
  Analyse: {
    src: BUSINESS_IMAGERY.analysis.report.src,
    alt: "Analysebericht und Auswertung",
  },
  Infrastruktur: {
    src: img("photo-1451187580459-43490279c0fa"),
    alt: "Technische Infrastruktur",
  },
  Templates: {
    src: img("photo-1547658719-da2b51169166"),
    alt: "Website-Vorlage am Bildschirm",
  },
  Einrichtung: {
    src: img("photo-1555066931-4365d14bab8c"),
    alt: "Technische Einrichtung und Go-Live",
  },
  Integration: {
    src: img("photo-1555949963-aa79dcee981c"),
    alt: "System-Integration und Anbindung",
  },
  Marketing: {
    src: img("photo-1460925895917-afdab827c52f"),
    alt: "Marketing-Kennzahlen und Sichtbarkeit",
  },
  Beratung: {
    src: BUSINESS_IMAGERY.analysis.benefits.advisory.src,
    alt: "Beratungsgespräch",
  },
  Service: {
    src: img("photo-1551288049-bebda4e38f71"),
    alt: "Monitoring und laufende Betreuung",
  },
};

export const SHOP_PRODUCT_IMAGES: Record<string, ShopProductImage> = {
  "analyse-quick": {
    src: BUSINESS_IMAGERY.analysis.report.src,
    alt: "Quick-Analyse PDF-Bericht",
  },
  "analyse-business": {
    src: BUSINESS_IMAGERY.analysis.workflow.src,
    alt: "Business-Analyse Gespräch",
  },
  "analyse-premium": {
    src: BUSINESS_IMAGERY.analysis.areas.strategy.src,
    alt: "Premium-Strategieberatung",
  },
  "domain-einrichtung": {
    src: img("photo-1451187580459-43490279c0fa"),
    alt: "Domain und Web-Adresse",
  },
  "domain-umzug": {
    src: img("photo-1558494949-ef010cbdcc31"),
    alt: "Domain-Umzug und Transfer",
  },
  "dns-konfiguration": {
    src: img("photo-1633265486064-086b219458ec"),
    alt: "DNS-Einträge und Netzwerk",
  },
  "hosting-einrichtung": {
    src: img("photo-1555066931-4365d14bab8c"),
    alt: "Hosting-Deployment am Laptop",
  },
  "email-einrichtung": {
    src: img("photo-1596526138085-aabe7f1e8f7f"),
    alt: "Geschäftliche E-Mail",
  },
  "google-workspace-einrichtung": {
    src: img("photo-1522202176988-66273c2fd55f"),
    alt: "Team-Kollaboration Workspace",
  },
  "supabase-einrichtung": {
    src: img("photo-1544383835-bda2bc66a55d"),
    alt: "Datenbank und Backend",
  },
  "vercel-einrichtung": {
    src: img("photo-1555066931-4365d14bab8c"),
    alt: "Vercel Deployment",
  },
  "datenbank-grundkonfiguration": {
    src: img("photo-1544383835-bda2bc66a55d"),
    alt: "Datenbank-Konfiguration",
  },
  "backup-konfiguration": {
    src: img("photo-1551288049-bebda4e38f71"),
    alt: "Backup und Datensicherung",
  },
  monitoring: {
    src: img("photo-1551288049-bebda4e38f71"),
    alt: "Monitoring-Dashboard",
  },
  "ssl-konfiguration": {
    src: img("photo-1563013544-824ae1b704d3"),
    alt: "SSL-Verschlüsselung und Sicherheit",
  },
  "domain-registrierung-service": {
    src: img("photo-1451187580459-43490279c0fa"),
    alt: "Domain-Registrierung",
  },
  "bundle-domain-hosting": {
    src: img("photo-1467232004584-a241de8bcf5d"),
    alt: "Domain und Website-Paket",
  },
  "stripe-einrichtung": {
    src: img("photo-1556740758-53c6a502ed14"),
    alt: "Online-Zahlung und Stripe",
  },
  "api-anbindung": {
    src: img("photo-1555949963-aa79dcee981c"),
    alt: "API-Programmierung",
  },
  "whatsapp-integration": {
    src: img("photo-1611746872915-64382b5c676d"),
    alt: "WhatsApp Business Nachrichten",
  },
  "newsletter-anbindung": {
    src: img("photo-1432888622747-4ebee778544b"),
    alt: "Newsletter und E-Mail-Marketing",
  },
  "kalender-buchungssystem": {
    src: img("photo-1506784367867-f2c67293a82a"),
    alt: "Online-Terminbuchung Kalender",
  },
  "seo-basis-setup": {
    src: img("photo-1460925895917-afdab827c52f"),
    alt: "SEO-Analyse und Rankings",
  },
  "impressum-datenschutz-setup": {
    src: img("photo-1450101499163-c8848c66ca85"),
    alt: "Rechtliche Website-Seiten",
  },
  "cookie-consent-setup": {
    src: img("photo-1563013544-824ae1b704d3"),
    alt: "Datenschutz und Cookie-Einwilligung",
  },
  "performance-optimierung": {
    src: img("photo-1551288049-bebda4e38f71"),
    alt: "Performance und Ladezeit",
  },
  "template-landingpage": {
    src: img("photo-1600880292203-757bb62b4baf"),
    alt: "Landingpage Stilrichtung Umzug & Logistik",
  },
  "template-business-website": {
    src: img("photo-1560185007-cde436f6a4d0"),
    alt: "Business-Website Stilrichtung Reinigung",
  },
  "template-website-admin": {
    src: img("photo-1579684385127-1ef15d508118"),
    alt: "Website mit Admin — Praxis-Stilrichtung",
  },
  "template-webapp": {
    src: img("photo-1581094794329-c8112a89af12"),
    alt: "Web-App Handwerk & Gewerbe",
  },
  "template-modul-bewertungen": {
    src: img("photo-1560472354-b33ff0c44a43"),
    alt: "Bewertungen und Sterne",
  },
  "template-modul-termin": {
    src: img("photo-1506784367867-f2c67293a82a"),
    alt: "Terminbuchung Modul",
  },
  "einrichtung-template-standard": {
    src: img("photo-1555066931-4365d14bab8c"),
    alt: "Template deployen und einrichten",
  },
  "einrichtung-template-pro": {
    src: img("photo-1497366216548-37526070297c"),
    alt: "Professionelle Template-Einrichtung",
  },
  "cms-wordpress-migration": {
    src: img("photo-1555949963-aa79dcee981c"),
    alt: "WordPress Migration Planung",
  },
  "technische-beratung-stunde": {
    src: BUSINESS_IMAGERY.analysis.benefits.advisory.src,
    alt: "Technische Beratung per Video",
  },
  "wartung-einmal-check": {
    src: img("photo-1563013544-824ae1b704d3"),
    alt: "Sicherheits- und Wartungscheck",
  },
  "servicepaket-basis": {
    src: img("photo-1522202176988-66273c2fd55f"),
    alt: "Basis-Support und Betreuung",
  },
  "servicepaket-business": {
    src: img("photo-1551288049-bebda4e38f71"),
    alt: "Business Service mit Priorität",
  },
  "servicepaket-premium": {
    src: BUSINESS_IMAGERY.analysis.areas.strategy.src,
    alt: "Premium Weiterentwicklung",
  },
};

export function getShopProductImage(product: ShopProduct): ShopProductImage {
  return (
    SHOP_PRODUCT_IMAGES[product.slug] ??
    CATEGORY_FALLBACK[product.category as ShopCategoryId] ?? {
      src: BUSINESS_IMAGERY.hero.feature,
      alt: product.name,
    }
  );
}
