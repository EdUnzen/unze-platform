"use client";

import { CreatorHelpTip } from "@/components/dashboard/CreatorHelpTip";
import { setPermissionOverrideAction } from "@/app/dashboard/governance-actions";
import {
  getPermissionsByCategory,
  PERMISSION_DEFINITIONS,
} from "@/lib/permissions/definitions";
import {
  getPermissionsByDisplayGroup,
} from "@/lib/permissions/display-groups";
import { ROLE_LABELS } from "@/lib/constants/dashboard";
import type { GovernancePermissionKey, PermissionOverride } from "@/types/governance";
import type { CommunityRole } from "@/types/database";
import { ChevronDown, KeyRound } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils/cn";

const CONFIGURABLE_ROLES: CommunityRole[] = [
  "moderator",
  "admin",
  "verified_member",
  "member",
];

interface PermissionOverridesPanelProps {
  slug: string;
  overrides: PermissionOverride[];
}

export function PermissionOverridesPanel({
  slug,
  overrides,
}: PermissionOverridesPanelProps) {
  const [pending, startTransition] = useTransition();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    content: true,
    moderation: true,
    administration: false,
    finance: false,
  });
  const displayGroups = getPermissionsByDisplayGroup(getPermissionsByCategory());

  function isGranted(role: CommunityRole, key: GovernancePermissionKey): boolean {
    const override = overrides.find(
      (o) => o.role === role && o.permissionKey === key,
    );
    if (override) return override.granted;

    const def = PERMISSION_DEFINITIONS.find((d) => d.key === key);
    if (!def) return false;

    const ranks: Record<CommunityRole, number> = {
      member: 0,
      verified_member: 0,
      moderator: 1,
      expert: 1,
      admin: 2,
      creator: 3,
    };
    return ranks[role] >= ranks[def.defaultMinRole];
  }

  function toggle(role: CommunityRole, key: GovernancePermissionKey) {
    const next = !isGranted(role, key);
    startTransition(async () => {
      await setPermissionOverrideAction(slug, key, role, next);
    });
  }

  return (
    <section className="rounded-2xl border border-unze-border bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-unze-green" aria-hidden />
        <h2 className="font-semibold text-unze-ink">Granulare Rechte</h2>
      </div>
      <p className="mb-4 text-xs text-unze-ink-secondary">
        Obergruppen zur {"\u00dc"}bersicht {"\u2014"} Overrides pro Rolle, Creator-Rechte
        gesch{"\u00fc"}tzt.
      </p>

      <CreatorHelpTip title="So funktioniert es" className="mb-4">
        Standardrechte gelten pro Rolle. Aktiviere hier nur Abweichungen {"\u2014"} z. B.
        Moderator darf Mitglieder verwalten, aber keine Finanzen sehen.
      </CreatorHelpTip>

      <div className="space-y-2">
        {displayGroups.map(({ group, permissions }) => {
          const visible = permissions.filter((d) => d.defaultMinRole !== "creator");
          if (visible.length === 0) return null;
          const isOpen = openGroups[group.id] ?? false;

          return (
            <div
              key={group.id}
              className="overflow-hidden rounded-xl border border-unze-border/70"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenGroups((prev) => ({ ...prev, [group.id]: !isOpen }))
                }
                className="flex w-full items-center justify-between gap-2 bg-unze-surface-muted/50 px-3 py-2.5 text-left"
              >
                <span>
                  <span className="block text-sm font-semibold text-unze-ink">
                    {group.label}
                  </span>
                  <span className="text-[11px] text-unze-ink-muted">{group.description}</span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-unze-ink-muted transition",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>

              {isOpen && (
                <div className="space-y-2 border-t border-unze-border/60 p-2">
                  {visible.map((def) => (
                    <div
                      key={def.key}
                      className="rounded-lg border border-unze-border/50 px-3 py-2"
                    >
                      <p className="text-sm font-medium text-unze-ink">{def.label}</p>
                      <p className="text-[11px] text-unze-ink-muted">{def.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {CONFIGURABLE_ROLES.map((role) => (
                          <button
                            key={role}
                            type="button"
                            disabled={pending}
                            onClick={() => toggle(role, def.key)}
                            className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                              isGranted(role, def.key)
                                ? "bg-unze-green text-white"
                                : "bg-unze-surface-muted text-unze-ink-muted"
                            }`}
                          >
                            {ROLE_LABELS[role]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
