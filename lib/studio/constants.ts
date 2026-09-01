import type { StudioInquiryStatus } from "@/lib/studio/types";

export const STUDIO_BRAND = {
  primary: "#1DB872",
  accent: "#00C853",
} as const;

export const STUDIO_INQUIRY_STATUSES: StudioInquiryStatus[] = [
  "neue_anfrage",
  "zahlung_ausstehend",
  "kontaktiert",
  "angebot",
  "abgeschlossen",
  "abgelehnt",
];

export const STUDIO_INQUIRY_STATUS_LABELS: Record<StudioInquiryStatus, string> = {
  neue_anfrage: "Neue Anfrage",
  zahlung_ausstehend: "Zahlung ausstehend",
  kontaktiert: "Kontaktiert",
  angebot: "Angebot",
  abgeschlossen: "Abgeschlossen",
  abgelehnt: "Abgelehnt",
};

export type StudioNavIcon =
  | "overview"
  | "inbox"
  | "shop"
  | "file"
  | "users"
  | "tag"
  | "receipt"
  | "camera";

export type StudioNavItem = {
  href: string;
  label: string;
  description: string;
  icon: StudioNavIcon;
};

/** Unten: nur der Alltag. */
export const STUDIO_PRIMARY_NAV_ITEMS: readonly StudioNavItem[] = [
  {
    href: "/studio/app/uebersicht",
    label: "Start",
    description: "Was heute anliegt",
    icon: "overview",
  },
  {
    href: "/studio/app",
    label: "Anfragen",
    description: "Eingang aus allen Bereichen",
    icon: "inbox",
  },
  {
    href: "/studio/app/marketing",
    label: "Marketing",
    description: "Bilder, Videos, Screens",
    icon: "camera",
  },
] as const;

/** Oben links: die komplette Landkarte. */
export const STUDIO_AREA_GROUPS: readonly {
  id: string;
  title: string;
  items: readonly StudioNavItem[];
}[] = [
  {
    id: "heute",
    title: "Heute",
    items: STUDIO_PRIMARY_NAV_ITEMS,
  },
  {
    id: "verkauf",
    title: "Verkauf",
    items: [
      {
        href: "/studio/app/auftraege",
        label: "Shop",
        description: "Buchungen und Zahlungen",
        icon: "shop",
      },
      {
        href: "/studio/app/kunden",
        label: "Kunden",
        description: "Kunden und Projekte",
        icon: "users",
      },
    ],
  },
  {
    id: "betrieb",
    title: "Betrieb",
    items: [
      {
        href: "/studio/app/angebote",
        label: "Angebote",
        description: "Angebote schreiben und nachverfolgen",
        icon: "file",
      },
      {
        href: "/studio/app/preise",
        label: "Preise",
        description: "Pakete und Preise",
        icon: "tag",
      },
      {
        href: "/studio/app/rechnungen",
        label: "Rechnungen",
        description: "Rechnungen und Zahlungsverkehr",
        icon: "receipt",
      },
    ],
  },
] as const;

export const STUDIO_NAV_ITEMS: readonly StudioNavItem[] = STUDIO_AREA_GROUPS.flatMap(
  (group) => group.items,
);

export const STUDIO_MOBILE_NAV_ITEMS = STUDIO_PRIMARY_NAV_ITEMS;

export const STUDIO_MORE_NAV_ITEMS = STUDIO_AREA_GROUPS.flatMap((group) =>
  group.id === "heute" ? [] : group.items,
);
