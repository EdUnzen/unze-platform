"use client";

import {
  grantBadgeAction,
  removeMemberAction,
  updateMemberRoleAction,
  updateMemberRoleTitleAction,
} from "@/app/dashboard/actions";
import { BanMemberButton } from "@/components/dashboard/RestrictionsPanel";
import { ActionSuccessBanner } from "@/components/ui/ActionSuccessBanner";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/lib/constants/dashboard";
import type { CommunityBadgeView, CommunityMemberView } from "@/types/dashboard";
import type { BadgeType, CommunityRole } from "@/types/database";
import { Award, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface MemberListClientProps {
  slug: string;
  members: CommunityMemberView[];
  viewerRole: CommunityRole;
  canManageRoles: boolean;
  canRemove: boolean;
  canBan?: boolean;
  communityBadges?: CommunityBadgeView[];
  memberAwards?: Record<string, { id: string; name: string; badgeType: BadgeType }[]>;
  canGrantAwards?: boolean;
}

export function MemberListClient({
  slug,
  members,
  viewerRole,
  canManageRoles,
  canRemove,
  canBan = false,
  communityBadges = [],
  memberAwards = {},
  canGrantAwards = false,
}: MemberListClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedBadgeByMember, setSelectedBadgeByMember] = useState<
    Record<string, string>
  >({});

  const handleRoleChange = (memberId: string, role: CommunityRole) => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await updateMemberRoleAction(slug, memberId, role);
      if (result.error) setError(result.error);
      else if (result.message) {
        setSuccess(result.message);
        router.refresh();
      }
    });
  };

  const handleRemove = (memberId: string) => {
    startTransition(async () => {
      setError(null);
      const result = await removeMemberAction(slug, memberId);
      if (result.error) setError(result.error);
    });
  };

  const handleRoleTitleBlur = (memberId: string, title: string) => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await updateMemberRoleTitleAction(slug, memberId, title);
      if (result.error) setError(result.error);
      else if (result.message) {
        setSuccess(result.message);
        router.refresh();
      }
    });
  };

  const handleGrantAward = (memberUserId: string, badgeId: string, badgeName: string) => {
    if (!badgeId) return;
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await grantBadgeAction(slug, badgeId, memberUserId, badgeName);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(result.message ?? "Auszeichnung vergeben");
      router.refresh();
    });
  };

  if (members.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-unze-ink-muted">
        Noch keine Mitglieder.
      </p>
    );
  }

  return (
    <div>
      {success && <ActionSuccessBanner message={success} className="mb-3" />}
      {error && (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {members.map((member) => {
          const name = member.displayName ?? member.username ?? "Nutzer";
          const isCreator = member.role === "creator";
          const awards = memberAwards[member.userId] ?? [];
          const selectedBadgeId =
            selectedBadgeByMember[member.userId] ?? communityBadges[0]?.id ?? "";

          return (
            <li
              key={member.id}
              className="rounded-2xl bg-white p-3 shadow-card"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={name}
                  seed={member.userId}
                  avatarUrl={member.avatarUrl}
                  size="md"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-unze-ink">{name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <RoleBadge role={member.role} active size="sm" />
                    {member.roleTitle?.trim() && (
                      <span className="text-xs text-unze-ink-muted">
                        {" · "}
                        {member.roleTitle.trim()}
                      </span>
                    )}
                  </div>
                  {awards.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {awards.map((award) => (
                        <span
                          key={award.id}
                          className="inline-flex items-center rounded-full bg-unze-green-muted px-2 py-0.5 text-[10px] font-medium text-unze-green-dark"
                        >
                          {award.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {canManageRoles &&
                    !isCreator &&
                    ["moderator", "admin", "expert"].includes(member.role) && (
                      <input
                        type="text"
                        defaultValue={member.roleTitle ?? ""}
                        placeholder="z. B. SSL Coach, Turnierleiter"
                        onBlur={(e) => handleRoleTitleBlur(member.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-unze-border bg-unze-surface-muted px-2 py-1 text-[11px]"
                        aria-label={`Anzeigename für ${name}`}
                      />
                    )}
                </div>

                {canManageRoles && !isCreator && (
                  <select
                    value={member.role}
                    disabled={pending}
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value as CommunityRole)
                    }
                    className="rounded-lg border border-unze-border bg-unze-surface-muted px-2 py-1.5 text-xs"
                    aria-label={`Rolle für ${name}`}
                  >
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                    {viewerRole === "creator" && (
                      <option value="admin">{ROLE_LABELS.admin}</option>
                    )}
                  </select>
                )}

                {canRemove && !isCreator && member.role !== "creator" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleRemove(member.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    aria-label={`${name} entfernen`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                {canBan && !isCreator && member.role !== "creator" && (
                  <BanMemberButton
                    slug={slug}
                    memberId={member.id}
                    userId={member.userId}
                    memberName={name}
                  />
                )}
              </div>

              {canGrantAwards && !isCreator && communityBadges.length > 0 && (
                <div className="mt-3 flex flex-col gap-2 border-t border-unze-border/60 pt-3 sm:flex-row sm:items-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-unze-ink-secondary">
                    <Award className="h-3.5 w-3.5 text-unze-green" aria-hidden />
                    Auszeichnung vergeben
                  </span>
                  <select
                    value={selectedBadgeId}
                    disabled={pending}
                    onChange={(e) =>
                      setSelectedBadgeByMember((prev) => ({
                        ...prev,
                        [member.userId]: e.target.value,
                      }))
                    }
                    className="min-w-0 flex-1 rounded-lg border border-unze-border bg-unze-surface-muted px-2 py-1.5 text-xs"
                    aria-label={`Auszeichnung für ${name}`}
                  >
                    {communityBadges.map((badge) => (
                      <option key={badge.id} value={badge.id}>
                        {badge.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={pending || !selectedBadgeId}
                    onClick={() => {
                      const badge = communityBadges.find((b) => b.id === selectedBadgeId);
                      if (!badge) return;
                      handleGrantAward(member.userId, badge.id, badge.name);
                    }}
                    className="rounded-lg bg-unze-green px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Vergeben
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
