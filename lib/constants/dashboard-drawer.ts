import type { DashboardTabId } from "@/types/dashboard";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Calendar,
  ClipboardList,
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  ScanLine,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserCog,
  Wallet,
} from "lucide-react";

export interface DashboardDrawerItem {
  id: DashboardTabId | "scanner";
  label: string;
  href: (slug: string) => string;
  icon: LucideIcon;
  minRole?: "moderator" | "admin" | "creator";
  attentionKey?: "applications" | "reports" | "removals" | "payments";
}

export interface DashboardDrawerSection {
  id: string;
  label: string;
  items: DashboardDrawerItem[];
}

export const DASHBOARD_DRAWER_SECTIONS: DashboardDrawerSection[] = [
  {
    id: "main",
    label: "Start",
    items: [
      {
        id: "overview",
        label: "Übersicht",
        href: (slug) => `/dashboard/community/${slug}`,
        icon: LayoutDashboard,
      },
      {
        id: "scanner",
        label: "Scanner",
        href: (slug) => `/dashboard/community/${slug}/scanner`,
        icon: ScanLine,
        minRole: "moderator",
      },
    ],
  },
  {
    id: "community",
    label: "Community",
    items: [
      {
        id: "members",
        label: "Mitglieder",
        href: (slug) => `/dashboard/community/${slug}/members`,
        icon: Users,
        minRole: "moderator",
        attentionKey: "removals",
      },
      {
        id: "requests",
        label: "Anträge",
        href: (slug) => `/dashboard/community/${slug}/requests`,
        icon: ClipboardList,
        minRole: "moderator",
        attentionKey: "applications",
      },
      {
        id: "access",
        label: "Zugang & Join",
        href: (slug) => `/dashboard/community/${slug}/access`,
        icon: KeyRound,
        minRole: "admin",
      },
      {
        id: "roles",
        label: "Rollen",
        href: (slug) => `/dashboard/community/${slug}/roles`,
        icon: UserCog,
        minRole: "admin",
      },
    ],
  },
  {
    id: "content",
    label: "Inhalte",
    items: [
      {
        id: "groups",
        label: "Gruppen",
        href: (slug) => `/dashboard/community/${slug}/groups`,
        icon: FolderOpen,
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
        id: "badges",
        label: "Badges",
        href: (slug) => `/dashboard/community/${slug}/badges`,
        icon: Award,
        minRole: "admin",
      },
    ],
  },
  {
    id: "business",
    label: "Business",
    items: [
      {
        id: "monetization",
        label: "Monetarisierung",
        href: (slug) => `/dashboard/community/${slug}/monetization`,
        icon: Wallet,
        minRole: "creator",
        attentionKey: "payments",
      },
    ],
  },
  {
    id: "safety",
    label: "Schutz",
    items: [
      {
        id: "moderation",
        label: "Moderation",
        href: (slug) => `/dashboard/community/${slug}/moderation`,
        icon: ShieldAlert,
        minRole: "moderator",
        attentionKey: "reports",
      },
      {
        id: "audit",
        label: "Audit",
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
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        id: "settings",
        label: "Einstellungen",
        href: (slug) => `/dashboard/community/${slug}/settings`,
        icon: Settings,
        minRole: "admin",
      },
    ],
  },
];
