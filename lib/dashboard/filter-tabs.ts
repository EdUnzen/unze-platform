import { DASHBOARD_TABS } from "@/lib/constants/dashboard";
import type { CommunityRole } from "@/types/database";

const ROLE_RANK: Record<CommunityRole, number> = {
  member: 0,
  verified_member: 0,
  moderator: 1,
  expert: 1,
  admin: 2,
  creator: 3,
};

export function getVisibleDashboardTabs(role: CommunityRole) {
  return DASHBOARD_TABS.filter((tab) => {
    if (!tab.minRole) return true;
    return ROLE_RANK[role] >= ROLE_RANK[tab.minRole];
  });
}
