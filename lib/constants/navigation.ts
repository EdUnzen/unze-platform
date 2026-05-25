import type { LucideIcon } from "lucide-react";
import { Compass, Heart, Home, User } from "lucide-react";

export type NavItemId = "home" | "discover" | "favorites" | "profile";

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "discover", label: "Discover", href: "/discover", icon: Compass },
  { id: "favorites", label: "Favoriten", href: "/favorites", icon: Heart },
  { id: "profile", label: "Profil", href: "/profile", icon: User },
];

export const PLUS_MENU_ITEMS = [
  {
    id: "post",
    label: "Beitrag erstellen",
    description: "Teile etwas mit deiner Community",
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
