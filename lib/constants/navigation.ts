import type { LucideIcon } from "lucide-react";
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
    label: "Home",
    href: "/",
    icon: Home,
    description: "Verwaltungs-Hub: Communities, Gruppen, Events, Anträge",
  },
  {
    id: "discover",
    label: "Discover",
    href: "/discover",
    icon: Compass,
    description: "Communities, Gruppen, Events, Dienstleistungen",
  },
  {
    id: "favorites",
    label: "Folge ich",
    href: "/favorites",
    icon: Heart,
    description: "Communities, denen du folgst",
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
  services: "Dienstleistungen",
};
