import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  FolderOpen,
  ScanLine,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import type { CommunityRole } from "@/types/database";
import { hasCommunityPermission } from "@/lib/permissions/community.permissions";
import { canReviewApplications } from "@/lib/permissions/community.permissions";

const ADMIN_ROLES: CommunityRole[] = ["creator", "admin"];

interface DashboardQuickActionsProps {
  slug: string;
  viewerRole: CommunityRole;
}

const ACTIONS = [
  {
    id: "scanner",
    label: "Scanner",
    href: (slug: string) => `/dashboard/community/${slug}/scanner`,
    icon: ScanLine,
    show: (role: CommunityRole) =>
      hasCommunityPermission(role, "moderate") ||
      hasCommunityPermission(role, "manage_members"),
  },
  {
    id: "members",
    label: "Mitglieder",
    href: (slug: string) => `/dashboard/community/${slug}/members`,
    icon: Users,
    show: (role: CommunityRole) => hasCommunityPermission(role, "manage_members"),
  },
  {
    id: "requests",
    label: "Antrge",
    href: (slug: string) => `/dashboard/community/${slug}/requests`,
    icon: ClipboardList,
    show: (role: CommunityRole) => canReviewApplications(role),
  },
  {
    id: "events",
    label: "Events",
    href: (slug: string) => `/dashboard/community/${slug}/events`,
    icon: Calendar,
    show: (role: CommunityRole) => ADMIN_ROLES.includes(role),
  },
  {
    id: "groups",
    label: "Gruppen",
    href: (slug: string) => `/dashboard/community/${slug}/groups`,
    icon: FolderOpen,
    show: (role: CommunityRole) => ADMIN_ROLES.includes(role),
  },
  {
    id: "monetization",
    label: "Finanzen",
    href: (slug: string) => `/dashboard/community/${slug}/monetization`,
    icon: Wallet,
    show: (role: CommunityRole) => role === "creator",
  },
  {
    id: "settings",
    label: "Einstellungen",
    href: (slug: string) => `/dashboard/community/${slug}/settings`,
    icon: Settings,
    show: (role: CommunityRole) => ADMIN_ROLES.includes(role),
  },
] as const;

export function DashboardQuickActions({ slug, viewerRole }: DashboardQuickActionsProps) {
  const visible = ACTIONS.filter((a) => a.show(viewerRole)).slice(0, 6);

  if (visible.length === 0) return null;

  return (
    <section>
      <header className="mb-2">
        <h2 className="text-sm font-semibold text-unze-ink">Schnellzugriff</h2>
        <p className="text-xs text-unze-ink-secondary">
          Men links fr alle Bereiche
        </p>
      </header>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visible.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href(slug)}
              data-testid={`dashboard-quick-${action.id}`}
              className="flex min-h-[72px] flex-col justify-between rounded-2xl border border-unze-border bg-white p-3 shadow-sm transition active:scale-[0.98] hover:border-unze-green/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-unze-green-muted">
                <Icon className="h-4 w-4 text-unze-green" aria-hidden />
              </span>
              <span className="text-sm font-semibold text-unze-ink">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
