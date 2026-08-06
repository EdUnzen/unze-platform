import type { DashboardTabId } from "@/types/dashboard";
import {
  Award,
  Calendar,
  ClipboardList,
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DashboardTab {
  id: DashboardTabId;
  label: string;
  href: (slug: string) => string;
  icon: LucideIcon;
  minRole?: "moderator" | "admin" | "creator";
}

export const DASHBOARD_TABS: DashboardTab[] = [
  {
    id: "overview",
    label: "Übersicht",
    href: (slug) => `/dashboard/community/${slug}`,
    icon: LayoutDashboard,
  },
  {
    id: "members",
    label: "Mitglieder",
    href: (slug) => `/dashboard/community/${slug}/members`,
    icon: Users,
    minRole: "moderator",
  },
  {
    id: "access",
    label: "Zugang",
    href: (slug) => `/dashboard/community/${slug}/access`,
    icon: KeyRound,
    minRole: "admin",
  },
  {
    id: "requests",
    label: "Anträge",
    href: (slug) => `/dashboard/community/${slug}/requests`,
    icon: ClipboardList,
    minRole: "moderator",
  },
  {
    id: "moderation",
    label: "Moderation",
    href: (slug) => `/dashboard/community/${slug}/moderation`,
    icon: ShieldAlert,
    minRole: "moderator",
  },
  {
    id: "audit",
    label: "Protokoll",
    href: (slug) => `/dashboard/community/${slug}/audit`,
    icon: ScrollText,
    minRole: "admin",
  },
  {
    id: "verification",
    label: "Verifizierung",
    href: (slug) => `/dashboard/community/${slug}/verification`,
    icon: ShieldCheck,
    minRole: "admin",
  },
  {
    id: "groups",
    label: "Gruppen",
    href: (slug) => `/dashboard/community/${slug}/groups`,
    icon: FolderOpen,
    minRole: "admin",
  },
  {
    id: "roles",
    label: "Rollen",
    href: (slug) => `/dashboard/community/${slug}/roles`,
    icon: Shield,
    minRole: "admin",
  },
  {
    id: "badges",
    label: "Auszeichnungen",
    href: (slug) => `/dashboard/community/${slug}/auszeichnungen`,
    icon: Award,
    minRole: "admin",
  },
  {
    id: "events",
    label: "Events",
    href: (slug) => `/dashboard/community/${slug}/events`,
    icon: Calendar,
    minRole: "admin",
  },
  {
    id: "monetization",
    label: "Monetarisierung",
    href: (slug) => `/dashboard/community/${slug}/monetization`,
    icon: Wallet,
    minRole: "creator",
  },
  {
    id: "settings",
    label: "Einstellungen",
    href: (slug) => `/dashboard/community/${slug}/settings`,
    icon: Settings,
    minRole: "admin",
  },
];

export interface DashboardTabGroup {
  id: string;
  label: string;
  tabIds: DashboardTabId[];
}

/** Gruppierte Dashboard-Navigation — weniger Tabs in einer Zeile */
export const DASHBOARD_TAB_GROUPS: DashboardTabGroup[] = [
  { id: "general", label: "Allgemein", tabIds: ["overview"] },
  {
    id: "members",
    label: "Mitglieder",
    tabIds: ["members", "requests", "access", "roles"],
  },
  {
    id: "content",
    label: "Inhalte",
    tabIds: ["groups", "events", "badges"],
  },
  {
    id: "safety",
    label: "Sicherheit",
    tabIds: ["moderation", "audit", "verification"],
  },
  { id: "business", label: "Finanzen", tabIds: ["monetization"] },
  { id: "system", label: "System", tabIds: ["settings"] },
];

export const ROLE_LABELS: Record<string, string> = {
  creator: "Creator",
  admin: "Admin",
  expert: "Experte",
  moderator: "Moderator",
  verified_member: "Verifiziertes Mitglied",
  member: "Mitglied",
};

export const ASSIGNABLE_ROLES = [
  "admin",
  "expert",
  "verified_member",
  "member",
] as const;
