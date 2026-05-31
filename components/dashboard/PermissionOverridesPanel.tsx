"use client";

import { setPermissionOverrideAction } from "@/app/dashboard/governance-actions";
import {
  getPermissionsByCategory,
  PERMISSION_DEFINITIONS,
} from "@/lib/permissions/definitions";
import { ROLE_LABELS } from "@/lib/constants/dashboard";
import type { GovernancePermissionKey, PermissionOverride } from "@/types/governance";
import type { CommunityRole } from "@/types/database";
import { KeyRound } from "lucide-react";
import { useTransition } from "react";

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
  const byCategory = getPermissionsByCategory();

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
        Overrides pro Rolle — Creator-Rechte sind geschützt.
      </p>

      {Object.entries(byCategory).map(([category, defs]) => (
        <div key={category} className="mb-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-unze-ink-muted">
            {category}
          </h3>
          <div className="space-y-2">
            {defs
              .filter((d) => d.defaultMinRole !== "creator")
              .map((def) => (
                <div
                  key={def.key}
                  className="rounded-xl border border-unze-border/60 px-3 py-2"
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
        </div>
      ))}
    </section>
  );
}
