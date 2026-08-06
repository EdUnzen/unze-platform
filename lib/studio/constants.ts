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

export const STUDIO_NAV_ITEMS = [
  { href: "/studio/app/uebersicht", label: "Start", icon: "overview" as const },
  { href: "/studio/app", label: "Leads", icon: "inbox" as const },
  { href: "/studio/app/auftraege", label: "Shop", icon: "shop" as const },
  { href: "/studio/app/angebote", label: "Angebote", icon: "file" as const },
  { href: "/studio/app/kunden", label: "Kunden", icon: "users" as const },
  { href: "/studio/app/preise", label: "Preise", icon: "tag" as const },
  { href: "/studio/app/rechnungen", label: "Rechnungen", icon: "receipt" as const },
  { href: "/studio/app/marketing", label: "Marketing", icon: "camera" as const },
] as const;
