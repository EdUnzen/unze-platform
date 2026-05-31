import type { DashboardTabId } from "@/types/dashboard";
import {
  Award,
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
    label: "Badges",
    href: (slug) => `/dashboard/community/${slug}/badges`,
    icon: Award,
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

export const ROLE_LABELS: Record<string, string> = {
  creator: "Creator",
  admin: "Admin",
  expert: "Experte / Coach",
  moderator: "Experte / Coach",
  verified_member: "Verifiziertes Mitglied",
  member: "Mitglied",
};

export const ASSIGNABLE_ROLES = [
  "admin",
  "expert",
  "verified_member",
  "member",
] as const;
