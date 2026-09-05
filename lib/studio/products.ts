export type StudioProductId = "unze-business" | "unze-connect" | "my-organizer-ai";

export type StudioProductStatus = "live" | "beta" | "development" | "discontinued";

export type StudioProductDefinition = {
  id: StudioProductId;
  name: string;
  tagline: string;
  status: StudioProductStatus;
  url?: string;
  analyticsPathPrefix?: string;
};

export const STUDIO_PRODUCTS: readonly StudioProductDefinition[] = [
  {
    id: "unze-business",
    name: "UNZE Business",
    tagline: "Agentur-Landing & Projektanfragen",
    status: "live",
    url: "https://www.unze.app/business",
    analyticsPathPrefix: "/business",
  },
  {
    id: "unze-connect",
    name: "UNZE Connect",
    tagline: "Separates Produkt — nur Plattform-Kennzahlen (kein Studio-Workflow)",
    status: "beta",
    url: "https://www.unze.app/communities",
  },
  {
    id: "my-organizer-ai",
    name: "My Organizer AI",
    tagline: "Nicht mehr für neue Kunden — Bestandskunden behalten Zugang",
    status: "discontinued",
  },
] as const;

export const STUDIO_PRODUCT_STATUS_LABELS: Record<StudioProductStatus, string> = {
  live: "Live",
  beta: "Beta",
  development: "In Entwicklung",
  discontinued: "Nicht verfügbar",
};
