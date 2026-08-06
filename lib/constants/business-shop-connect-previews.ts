import type { MockVariant } from "@/lib/constants/business-mock-types";

/** Referenz-Stil UNZE Connect / Plattform-Netzwerk — für Web-App-Produkte im Shop */
export type ShopConnectPreview = {
  id: string;
  label: string;
  subtitle: string;
  variant: MockVariant;
  device?: "phone" | "desktop";
};

export const SHOP_CONNECT_APP_PREVIEWS: ShopConnectPreview[] = [
  {
    id: "connect-discover",
    label: "Discover",
    subtitle: "Community & Netzwerk",
    variant: "community",
    device: "desktop",
  },
  {
    id: "connect-dashboard",
    label: "Dashboard",
    subtitle: "Verwaltung & Übersicht",
    variant: "dashboard",
    device: "desktop",
  },
  {
    id: "connect-webapp",
    label: "Web-App",
    subtitle: "App-Oberfläche",
    variant: "webapp",
    device: "phone",
  },
];
