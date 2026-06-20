import {
  DASHBOARD_DRAWER_SECTIONS,
  type DashboardDrawerItem,
} from "@/lib/constants/dashboard-drawer";
import type { CommunityRole } from "@/types/database";

const ROLE_RANK: Record<CommunityRole, number> = {
  member: 0,
  verified_member: 0,
  moderator: 1,
  expert: 1,
  admin: 2,
  creator: 3,
};

function canSeeItem(role: CommunityRole, item: DashboardDrawerItem): boolean {
  if (!item.minRole) return true;
  return ROLE_RANK[role] >= ROLE_RANK[item.minRole];
}

export function getVisibleDashboardDrawerSections(role: CommunityRole) {
  return DASHBOARD_DRAWER_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canSeeItem(role, item)),
  })).filter((section) => section.items.length > 0);
}

export function getDashboardAttentionTotal(
  counts: {
    applications: number;
    reports: number;
    removals: number;
    payments: number;
  },
  role: CommunityRole,
  monetizationEnabled: boolean,
): number {
  const sections = getVisibleDashboardDrawerSections(role);
  let total = 0;

  for (const section of sections) {
    for (const item of section.items) {
      if (!item.attentionKey) continue;
      if (item.attentionKey === "payments" && (!monetizationEnabled || role !== "creator")) {
        continue;
      }
      total += counts[item.attentionKey] ?? 0;
    }
  }

  return total;
}
