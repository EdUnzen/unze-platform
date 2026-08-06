import type { GovernancePermissionKey, PermissionDefinition } from "@/types/governance";
import type { CommunityRole } from "@/types/database";

/**
 * Katalog aller granularen Community-Rechte.
 * DB-Seed: community_permission_definitions (Migration 010)
 */
export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { key: "view", label: "Ansehen", description: "Community-Inhalte ansehen", defaultMinRole: "member", category: "content" },
  { key: "post", label: "Beiträge erstellen", description: "Posts erstellen", defaultMinRole: "member", category: "content" },
  { key: "comment", label: "Kommentieren", description: "Kommentare schreiben", defaultMinRole: "member", category: "content" },
  { key: "moderate", label: "Moderieren", description: "Inhalte moderieren", defaultMinRole: "moderator", category: "moderation" },
  { key: "review_applications", label: "Anträge prüfen", description: "Beitrittsanträge prüfen", defaultMinRole: "moderator", category: "access" },
  { key: "manage_invites", label: "Einladungen", description: "Einladungslinks verwalten", defaultMinRole: "moderator", category: "access" },
  { key: "ban_members", label: "Sperren", description: "Bann/Mute/Strikes", defaultMinRole: "moderator", category: "moderation" },
  { key: "view_restrictions", label: "Sperren einsehen", description: "Moderationshistorie", defaultMinRole: "moderator", category: "moderation" },
  { key: "manage_reports", label: "Meldungen", description: "Reports bearbeiten", defaultMinRole: "moderator", category: "moderation" },
  { key: "view_audit_log", label: "Audit-Log", description: "Governance-Nachverfolgung", defaultMinRole: "admin", category: "governance" },
  { key: "manage_members", label: "Mitglieder", description: "Entfernen/Wiederherstellen", defaultMinRole: "admin", category: "members" },
  { key: "manage_roles", label: "Rollen", description: "Rollen zuweisen", defaultMinRole: "admin", category: "members" },
  { key: "manage_settings", label: "Einstellungen", description: "Community-Einstellungen", defaultMinRole: "admin", category: "settings" },
  { key: "manage_access", label: "Zugang", description: "Beitrittslogik & Status", defaultMinRole: "admin", category: "access" },
  { key: "manage_join_questions", label: "Bewerbungsfragen", description: "Antragsfragen", defaultMinRole: "admin", category: "access" },
  { key: "manage_permissions", label: "Rechte", description: "Rollen-Rechte konfigurieren", defaultMinRole: "admin", category: "governance" },
  { key: "manage_monetization", label: "Monetarisierung", description: "Stripe vorbereitet", defaultMinRole: "creator", category: "monetization" },
  { key: "archive_community", label: "Archivieren", description: "Pausieren/Archivieren", defaultMinRole: "creator", category: "lifecycle" },
  { key: "delete_community", label: "Löschen", description: "Soft-Delete", defaultMinRole: "creator", category: "lifecycle" },
  { key: "transfer_ownership", label: "Ownership", description: "Creator übertragen", defaultMinRole: "creator", category: "lifecycle" },
];

export const ROLE_RANK: Record<CommunityRole, number> = {
  member: 0,
  verified_member: 0,
  moderator: 1,
  expert: 1,
  admin: 2,
  creator: 3,
};

const DEFAULT_MIN_ROLE: Record<GovernancePermissionKey, CommunityRole> =
  Object.fromEntries(
    PERMISSION_DEFINITIONS.map((d) => [d.key, d.defaultMinRole]),
  ) as Record<GovernancePermissionKey, CommunityRole>;

export function getDefaultMinRole(permission: GovernancePermissionKey): CommunityRole {
  return DEFAULT_MIN_ROLE[permission];
}

export function getPermissionsForRole(role: CommunityRole): GovernancePermissionKey[] {
  return PERMISSION_DEFINITIONS.filter(
    (d) => ROLE_RANK[role] >= ROLE_RANK[d.defaultMinRole],
  ).map((d) => d.key);
}

export function getPermissionsByCategory(): Record<string, PermissionDefinition[]> {
  return PERMISSION_DEFINITIONS.reduce<Record<string, PermissionDefinition[]>>(
    (acc, def) => {
      if (!acc[def.category]) acc[def.category] = [];
      acc[def.category].push(def);
      return acc;
    },
    {},
  );
}
