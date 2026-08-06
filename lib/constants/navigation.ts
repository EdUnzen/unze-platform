import type { LucideIcon } from "lucide-react";
import { CONNECT_HOME_PATH } from "@/lib/constants/site";
import { PLATFORM_PILLAR_LIST } from "@/lib/constants/platform-copy";
import { Compass, Heart, Home, User } from "lucide-react";

export type NavItemId = "home" | "discover" | "favorites" | "profile";

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Kurzbeschreibung für Dokumentation / Accessibility */
  description?: string;
}

/**
 * Hauptnavigation — Verwaltung (Home), Entdeckung, Folge-Communities, Profil.
 * Kein Feed-Tab.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "Start",
    href: CONNECT_HOME_PATH,
    icon: Home,
    description: `Verwaltungs-Hub: ${PLATFORM_PILLAR_LIST}`,
  },
  {
    id: "discover",
    label: "Entdecken",
    href: "/discover",
    icon: Compass,
    description: PLATFORM_PILLAR_LIST,
  },
  {
    id: "favorites",
    label: "Favoriten",
    href: "/favorites",
    icon: Heart,
    description: `Gefolgte ${PLATFORM_PILLAR_LIST}`,
  },
  {
    id: "profile",
    label: "Profil",
    href: "/profile",
    icon: User,
    description: "Profil, Einstellungen, Verknüpfungen",
  },
];

export const PLUS_MENU_ITEMS = [
  {
    id: "post",
    label: "Ankündigung erstellen",
    description: "Ankündigung, Event oder Service für eine Community",
    href: "/create/post",
  },
  {
    id: "community",
    label: "Community erstellen",
    description: "Starte deine eigene Community",
    href: "/create/community",
  },
  {
    id: "dashboard",
    label: "Dashboard öffnen",
    description: "Verwalte Communities & Creator-Tools",
    href: "/dashboard",
  },
] as const;

/** Discover-Tabs (kein Feed, kein Creator-Tab) */
export const DISCOVER_TAB_IDS = [
  "communities",
  "groups",
  "events",
  "services",
] as const;

export type DiscoverTabId = (typeof DISCOVER_TAB_IDS)[number];

export const DISCOVER_TAB_LABELS: Record<DiscoverTabId, string> = {
  communities: "Communities",
  groups: "Gruppen",
  events: "Events",
  services: "Services",
};
