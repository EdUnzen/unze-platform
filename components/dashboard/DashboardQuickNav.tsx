import Link from "next/link";
import {
  ClipboardList,
  Settings,
  Shield,
  Users,
  UserCog,
} from "lucide-react";
import { canReviewApplications } from "@/lib/permissions/community.permissions";
import { hasCommunityPermission } from "@/lib/permissions/community.permissions";
import type { CommunityRole } from "@/types/database";

interface DashboardQuickNavProps {
  slug: string;
  viewerRole: CommunityRole;
  pendingApplications?: number;
  pendingReports?: number;
  pendingRemovals?: number;
}

const NAV_ITEMS = [
  {
    id: "access",
    label: "Zugang",
    href: (slug: string) => `/dashboard/community/${slug}/access`,
    icon: Settings,
    minCheck: (role: CommunityRole) => hasCommunityPermission(role, "manage_access"),
  },
  {
    id: "requests",
    label: "Anträge",
    href: (slug: string) => `/dashboard/community/${slug}/requests`,
    icon: ClipboardList,
    minCheck: (role: CommunityRole) => canReviewApplications(role),
  },
  {
    id: "members",
    label: "Mitglieder",
    href: (slug: string) => `/dashboard/community/${slug}/members`,
    icon: Users,
    minCheck: (role: CommunityRole) => hasCommunityPermission(role, "manage_members"),
  },
  {
    id: "moderation",
    label: "Moderation",
    href: (slug: string) => `/dashboard/community/${slug}/moderation`,
    icon: Shield,
    minCheck: (role: CommunityRole) => hasCommunityPermission(role, "moderate"),
  },
  {
    id: "roles",
    label: "Rollen",
    href: (slug: string) => `/dashboard/community/${slug}/roles`,
    icon: UserCog,
    minCheck: (role: CommunityRole) => hasCommunityPermission(role, "manage_roles"),
  },
] as const;

export function DashboardQuickNav({
  slug,
  viewerRole,
  pendingApplications = 0,
  pendingReports = 0,
  pendingRemovals = 0,
}: DashboardQuickNavProps) {
  const items = NAV_ITEMS.filter((item) => item.minCheck(viewerRole));

  return (
    <nav
      className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      aria-label="Schnellzugriff Creator-Tools"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const badge =
          item.id === "requests"
            ? pendingApplications
            : item.id === "moderation"
              ? pendingReports
              : item.id === "members"
                ? pendingRemovals
                : 0;

        return (
          <Link
            key={item.id}
            href={item.href(slug)}
            data-testid={`dashboard-quick-${item.id}`}
            className="flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-2xl border-2 border-unze-border bg-white px-4 py-3 text-sm font-semibold text-unze-ink shadow-sm transition-all hover:border-unze-green/40 hover:bg-unze-green-muted/20 active:scale-[0.98]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-unze-green-muted">
              <Icon className="h-4 w-4 text-unze-green" aria-hidden />
            </span>
            {item.label}
            {badge > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
