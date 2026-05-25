"use client";

import {
  createInviteLinkAction,
  deactivateInviteLinkAction,
} from "@/app/dashboard/invite-actions";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/lib/constants/dashboard";
import type { CommunityInviteLink } from "@/types/access";
import { cn } from "@/lib/utils/cn";
import { Copy, Link2, Plus, Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

interface InviteLinkManagerProps {
  slug: string;
  links: CommunityInviteLink[];
  canManage: boolean;
}

export function InviteLinkManager({
  slug,
  links,
  canManage,
}: InviteLinkManagerProps) {
  const [createState, createAction, createPending] = useActionState(
    createInviteLinkAction.bind(null, slug),
    null,
  );
  const [deletePending, startDelete] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  if (!canManage) {
    return (
      <p className="text-sm text-unze-ink-muted">
        Keine Berechtigung für Einladungslinks.
      </p>
    );
  }

  const copyLink = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-card">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-unze-ink">
        <Link2 className="h-4 w-4 text-unze-green" aria-hidden />
        Einladungslinks
      </h3>
      <p className="mb-4 text-xs text-unze-ink-muted">
        Zeitlich begrenzt, einmalig oder mit automatischer Rollenvergabe.
      </p>

      {links.length > 0 && (
        <ul className="mb-4 space-y-2">
          {links.map((link) => {
            const url =
              link.inviteUrl ??
              `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${link.code}`;
            const inactive = !link.isActive || link.isExpired || link.isExhausted;

            return (
              <li
                key={link.id}
                className={cn(
                  "rounded-xl border p-3 text-xs",
                  inactive
                    ? "border-unze-border bg-unze-surface-muted/50 opacity-70"
                    : "border-unze-green/30 bg-unze-green-muted/20",
                )}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-unze-ink">
                      {link.label ?? "Einladung"}
                    </p>
                    <p className="text-unze-ink-muted">
                      Rolle: {ROLE_LABELS[link.assignedRole]} ·{" "}
                      {link.useCount}
                      {link.maxUses ? `/${link.maxUses}` : ""} Nutzungen
                      {link.isSingleUse && " · Einmalig"}
                    </p>
                    {link.expiresAt && (
                      <p className="text-unze-ink-muted">
                        Läuft ab:{" "}
                        {new Date(link.expiresAt).toLocaleString("de-DE")}
                      </p>
                    )}
                  </div>
                  {link.isActive && (
                    <button
                      type="button"
                      disabled={deletePending}
                      onClick={() =>
                        startDelete(async () => {
                          await deactivateInviteLinkAction(slug, link.id);
                        })
                      }
                      className="text-red-500"
                      aria-label="Link deaktivieren"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {!inactive && (
                  <button
                    type="button"
                    onClick={() => copyLink(url, link.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 font-medium text-unze-green"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied === link.id ? "Kopiert!" : "Link kopieren"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form action={createAction} className="space-y-3 border-t border-unze-border pt-4">
        <p className="flex items-center gap-1 text-xs font-medium text-unze-ink">
          <Plus className="h-3.5 w-3.5" /> Neuer Einladungslink
        </p>
        <input
          name="label"
          placeholder="Bezeichnung (optional)"
          className={inputClass}
        />
        <select name="assignedRole" className={inputClass} defaultValue="member">
          {ASSIGNABLE_ROLES.map((r) => (
            <option key={r} value={r}>
              Rolle: {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-unze-ink-muted">
              Gültig bis
            </label>
            <input
              type="datetime-local"
              name="expiresAt"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-unze-ink-muted">
              Max. Nutzungen
            </label>
            <input
              type="number"
              name="maxUses"
              min={1}
              placeholder="Unbegrenzt"
              className={inputClass}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="isSingleUse" />
            Einmaliger Link
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="bypassClosed" defaultChecked />
            Umgeht geschlossene/pausierte Aufnahme
          </label>
        </div>
        {createState?.error && (
          <p className="text-xs text-red-600">{createState.error}</p>
        )}
        <button
          type="submit"
          disabled={createPending}
          className="w-full rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {createPending ? "Erstellen…" : "Link erstellen"}
        </button>
      </form>
    </section>
  );
}
