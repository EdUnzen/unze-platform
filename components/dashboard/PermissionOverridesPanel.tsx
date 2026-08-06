"use client";

import { setPermissionOverrideAction } from "@/app/dashboard/governance-actions";
import { CreatorHelpTip } from "@/components/dashboard/CreatorHelpTip";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { ROLE_LABELS } from "@/lib/constants/dashboard";
import {
  getPermissionsByCategory,
  PERMISSION_DEFINITIONS,
} from "@/lib/permissions/definitions";
import { getPermissionsByDisplayGroup } from "@/lib/permissions/display-groups";
import type { GovernancePermissionKey, PermissionOverride } from "@/types/governance";
import type { CommunityRole } from "@/types/database";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, KeyRound, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

const CONFIGURABLE_ROLES: CommunityRole[] = [
  "moderator",
  "admin",
  "verified_member",
  "member",
];

const ROLE_RANKS: Record<CommunityRole, number> = {
  member: 0,
  verified_member: 0,
  moderator: 1,
  expert: 1,
  admin: 2,
  creator: 3,
};

function grantKey(role: CommunityRole, permissionKey: GovernancePermissionKey) {
  return `${role}:${permissionKey}`;
}

function computeEffectiveGrant(
  role: CommunityRole,
  key: GovernancePermissionKey,
  overrides: PermissionOverride[],
): boolean {
  const override = overrides.find((o) => o.role === role && o.permissionKey === key);
  if (override) return override.granted;

  const def = PERMISSION_DEFINITIONS.find((d) => d.key === key);
  if (!def) return false;
  return ROLE_RANKS[role] >= ROLE_RANKS[def.defaultMinRole];
}

function buildGrantSnapshot(
  overrides: PermissionOverride[],
  permissionKeys: GovernancePermissionKey[],
): Record<string, boolean> {
  const snapshot: Record<string, boolean> = {};
  for (const key of permissionKeys) {
    for (const role of CONFIGURABLE_ROLES) {
      snapshot[grantKey(role, key)] = computeEffectiveGrant(role, key, overrides);
    }
  }
  return snapshot;
}

interface PermissionOverridesPanelProps {
  slug: string;
  overrides: PermissionOverride[];
}

export function PermissionOverridesPanel({
  slug,
  overrides,
}: PermissionOverridesPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ variant: "success" | "error"; message: string } | null>(
    null,
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    content: true,
    moderation: true,
    administration: false,
    finance: false,
  });

  const displayGroups = getPermissionsByDisplayGroup(getPermissionsByCategory());
  const permissionKeys = useMemo(
    () =>
      displayGroups
        .flatMap((g) => g.permissions)
        .filter((d) => d.defaultMinRole !== "creator")
        .map((d) => d.key),
    [displayGroups],
  );

  const baselineRef = useRef<Record<string, boolean>>({});
  const [localGrants, setLocalGrants] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const snapshot = buildGrantSnapshot(overrides, permissionKeys);
    baselineRef.current = snapshot;
    setLocalGrants(snapshot);
    setFeedback(null);
  }, [overrides, permissionKeys]);

  const isDirty = useMemo(
    () =>
      permissionKeys.some((key) =>
        CONFIGURABLE_ROLES.some(
          (role) =>
            localGrants[grantKey(role, key)] !== baselineRef.current[grantKey(role, key)],
        ),
      ),
    [localGrants, permissionKeys],
  );

  function isGranted(role: CommunityRole, key: GovernancePermissionKey): boolean {
    return localGrants[grantKey(role, key)] ?? computeEffectiveGrant(role, key, overrides);
  }

  function toggle(role: CommunityRole, key: GovernancePermissionKey) {
    const k = grantKey(role, key);
    setLocalGrants((prev) => ({ ...prev, [k]: !prev[k] }));
    setFeedback(null);
  }

  function handleSave() {
    startTransition(async () => {
      const changes: { role: CommunityRole; key: GovernancePermissionKey; granted: boolean }[] =
        [];

      for (const key of permissionKeys) {
        for (const role of CONFIGURABLE_ROLES) {
          const k = grantKey(role, key);
          if (localGrants[k] !== baselineRef.current[k]) {
            changes.push({ role, key, granted: localGrants[k] });
          }
        }
      }

      if (changes.length === 0) {
        setFeedback({ variant: "success", message: "Keine Änderungen zum Speichern." });
        return;
      }

      let failed = 0;
      for (const change of changes) {
        const result = await setPermissionOverrideAction(
          slug,
          change.key,
          change.role,
          change.granted,
        );
        if (result.error) failed += 1;
      }

      if (failed > 0) {
        setFeedback({
          variant: "error",
          message: `${failed} Rechte konnten nicht gespeichert werden.`,
        });
        return;
      }

      baselineRef.current = { ...localGrants };
      setFeedback({
        variant: "success",
        message: "Granulare Rechte gespeichert.",
      });
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-unze-border bg-white p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-unze-green" aria-hidden />
          <h2 className="font-semibold text-unze-ink">Granulare Rechte</h2>
        </div>
        <button
          type="button"
          disabled={pending || !isDirty}
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-unze-green px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" aria-hidden />
          {pending ? "Speichert…" : "Rechte speichern"}
        </button>
      </div>

      <p className="mb-4 text-xs text-unze-ink-secondary">
        {"Änderungen werden erst nach \"Rechte speichern\" wirksam. Creator-Rechte bleiben geschützt."}
      </p>

      <CreatorHelpTip title="So funktioniert es" className="mb-4">
        Standardrechte gelten pro Rolle. Aktiviere hier nur Abweichungen {"—"} z. B.
        Moderator darf Mitglieder verwalten, aber keine Finanzen sehen.
      </CreatorHelpTip>

      {feedback && (
        <ActionFeedback variant={feedback.variant} className="mb-4">
          {feedback.message}
        </ActionFeedback>
      )}

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
