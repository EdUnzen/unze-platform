"use client";

import {
  removeMemberAction,
  updateMemberRoleAction,
  updateMemberRoleTitleAction,
} from "@/app/dashboard/actions";
import { BanMemberButton } from "@/components/dashboard/RestrictionsPanel";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/lib/constants/dashboard";
import type { CommunityMemberView } from "@/types/dashboard";
import type { CommunityRole } from "@/types/database";
import { Trash2 } from "lucide-react";
import { useTransition, useState } from "react";

interface MemberListClientProps {
  slug: string;
  members: CommunityMemberView[];
  viewerRole: CommunityRole;
  canManageRoles: boolean;
  canRemove: boolean;
  canBan?: boolean;
}

export function MemberListClient({
  slug,
  members,
  viewerRole,
  canManageRoles,
  canRemove,
  canBan = false,
}: MemberListClientProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (memberId: string, role: CommunityRole) => {
    startTransition(async () => {
      setError(null);
      const result = await updateMemberRoleAction(slug, memberId, role);
      if (result.error) setError(result.error);
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
      const result = await updateMemberRoleTitleAction(slug, memberId, title);
      if (result.error) setError(result.error);
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
      <ul className="flex flex-col gap-2">
        {members.map((member) => {
          const name =
            member.displayName ?? member.username ?? "Nutzer";
          const isCreator = member.role === "creator";

          return (
            <li
              key={member.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card"
            >
              <UserAvatar
                name={name}
                seed={member.userId}
                avatarUrl={member.avatarUrl}
                size="md"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-unze-ink">{name}</p>
                <p className="text-xs text-unze-ink-muted">
                  {member.roleTitle ?? ROLE_LABELS[member.role]}
                  {member.isVerified && " · Verifiziert"}
                </p>
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
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="mt-3 text-center text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
