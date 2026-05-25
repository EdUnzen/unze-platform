"use client";

import {
  removeMemberAction,
  updateMemberRoleAction,
} from "@/app/dashboard/actions";
import { BanMemberButton } from "@/components/dashboard/RestrictionsPanel";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/lib/constants/dashboard";
import type { CommunityMemberView } from "@/types/dashboard";
import type { CommunityRole } from "@/types/database";
import { Trash2, User } from "lucide-react";
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
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-unze-surface-muted">
                {member.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-unze-ink-muted" aria-hidden />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-unze-ink">{name}</p>
                <p className="text-xs text-unze-ink-muted">
                  {ROLE_LABELS[member.role]}
                  {member.isVerified && " · Verifiziert"}
                </p>
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
