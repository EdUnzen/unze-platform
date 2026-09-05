import { ROLE_LABELS } from "@/lib/constants/dashboard";
import type { CommunityRole } from "@/types/database";

export type PersonalMilestonePrefs = {
  ownAwards: boolean;
  ownRoles: boolean;
};

export const DEFAULT_PERSONAL_MILESTONE_PREFS: PersonalMilestonePrefs = {
  ownAwards: true,
  ownRoles: true,
};

export function formatCommunityRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export function buildAwardGrantedNotification(input: {
  badgeName: string;
  communityTitle: string;
}): { title: string; body: string } {
  const badgeName = input.badgeName.trim() || "Auszeichnung";
  const communityTitle = input.communityTitle.trim() || "Community";

  return {
    title: "Herzlichen Glückwunsch!",
    body: `Du hast die Auszeichnung „${badgeName}" in ${communityTitle} erhalten.`,
  };
}

export function buildRoleChangedNotification(input: {
  communityTitle: string;
  toRole: string;
  roleTitle?: string | null;
  fromRole?: string | null;
}): { title: string; body: string } {
  const communityTitle = input.communityTitle.trim() || "Community";
  const roleLabel = formatCommunityRoleLabel(input.toRole);

  if (input.roleTitle?.trim()) {
    return {
      title: "Herzlichen Glückwunsch!",
      body: `Du bist jetzt ${input.roleTitle.trim()} in ${communityTitle}.`,
    };
  }

  return {
    title: "Herzlichen Glückwunsch!",
    body: `Du bist jetzt ${roleLabel} in ${communityTitle}.`,
  };
}

export function buildRoleTitleChangedNotification(input: {
  communityTitle: string;
  roleTitle: string;
  role?: CommunityRole | string | null;
}): { title: string; body: string } {
  const communityTitle = input.communityTitle.trim() || "Community";
  const title = input.roleTitle.trim();

  if (title) {
    return {
      title: "Herzlichen Glückwunsch!",
      body: `Dein Titel in ${communityTitle} wurde aktualisiert: ${title}.`,
    };
  }

  const roleLabel = input.role
    ? formatCommunityRoleLabel(input.role)
    : "Mitglied";

  return {
    title: "Rolle aktualisiert",
    body: `Dein Anzeigetitel in ${communityTitle} wurde entfernt. Deine Rolle: ${roleLabel}.`,
  };
}
