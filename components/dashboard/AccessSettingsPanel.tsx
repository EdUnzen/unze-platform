"use client";

import {
  createJoinQuestionAction,
  deleteJoinQuestionAction,
  updateAccessSettingsAction,
} from "@/app/dashboard/access-actions";
import {
  ACCESS_STATUS_OPTIONS,
  JOIN_APPROVAL_OPTIONS,
  JOIN_QUESTION_TYPE_OPTIONS,
} from "@/lib/constants/access";
import { PlatformIdGroupsFieldset } from "@/components/dashboard/PlatformIdGroupsFieldset";
import { CreatorHelpTip } from "@/components/dashboard/CreatorHelpTip";
import { COMMUNITY_ACCESS_MODE_PRESETS } from "@/lib/access/presets";
import type { CommunityAccessConfig, JoinQuestion } from "@/types/access";
import { cn } from "@/lib/utils/cn";
import { Plus, Trash2 } from "lucide-react";
import { useActionState, useTransition } from "react";

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 text-sm outline-none focus:border-unze-green";

interface AccessSettingsPanelProps {
  slug: string;
  config: CommunityAccessConfig | null;
  questions: JoinQuestion[];
  canManage: boolean;
}

export function AccessSettingsPanel({
  slug,
  config,
  questions,
  canManage,
}: AccessSettingsPanelProps) {
  const [settingsState, settingsAction, settingsPending] = useActionState(
    updateAccessSettingsAction.bind(null, slug),
    null,
  );
  const [questionState, questionAction, questionPending] = useActionState(
    createJoinQuestionAction.bind(null, slug),
    null,
  );
  const [deletePending, startDelete] = useTransition();

  if (!canManage) {
    return (
      <p className="text-sm text-unze-ink-muted">
        Keine Berechtigung für Zugangseinstellungen.
      </p>
    );
  }

  const c = config ?? {
    accessMode: "open" as const,
    accessStatus: "open" as const,
    admissionsPaused: false,
    memberLimit: null,
    joinApprovalMode: "auto_accept" as const,
    communityRules: null,
    requireRulesConsent: false,
    requireAgeVerification: false,
    minAge: null,
    requiredPlatformIds: [],
    waitlistEnabled: false,
    autoRejectAtLimit: true,
    autoMessagesEnabled: true,
    rejoinCooldownDays: null,
    allowRejoinAfterBan: false,
    paidJoinRequired: false,
    archivedAt: null,
    lifecycleNotes: null,
  };

  return (
    <div className="space-y-6">
      <CreatorHelpTip title="Zugang in drei Schritten">
        1) Community-Typ w{"ä"}hlen (offen/privat/geschlossen). 2) Optional Limits und
        Fragen setzen. 3) Voraussetzungen weiter unten konfigurieren.
      </CreatorHelpTip>

      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-unze-ink">
          Community-Typ (Creator)
        </h3>
        <form action={settingsAction} className="space-y-4">
          <fieldset>
            <legend className="sr-only">Community-Zugangsmodus</legend>
            <div className="space-y-2">
              {COMMUNITY_ACCESS_MODE_PRESETS.map((preset) => (
                <label
                  key={preset.accessMode}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-2xl border p-3 transition-colors",
                    c.accessMode === preset.accessMode
                      ? "border-unze-green bg-unze-green-muted/40"
                      : "border-unze-border",
                  )}
                >
                  <input
                    type="radio"
                    name="accessMode"
                    value={preset.accessMode}
                    defaultChecked={c.accessMode === preset.accessMode}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-unze-ink">
                      {preset.label}
                    </span>
                    <span className="block text-xs text-unze-ink-secondary">
                      {preset.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <h3 className="pt-2 text-sm font-semibold text-unze-ink">
            Erweiterte Einstellungen
          </h3>
          <div>
            <label className="mb-1 block text-xs font-medium">Zugangsstatus</label>
            <select
              name="accessStatus"
              defaultValue={c.accessStatus}
              className={inputClass}
            >
              {ACCESS_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Beitrittslogik</label>
            <select
              name="joinApprovalMode"
              defaultValue={c.joinApprovalMode}
              className={inputClass}
            >
              {JOIN_APPROVAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Mitgliederlimit</label>
              <input
                name="memberLimit"
                type="number"
                min={1}
                defaultValue={c.memberLimit ?? ""}
                placeholder="Unbegrenzt"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Mindestalter</label>
              <input
                name="minAge"
                type="number"
                min={13}
                max={120}
                defaultValue={c.minAge ?? ""}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Community-Regeln</label>
            <textarea
              name="communityRules"
              rows={4}
              defaultValue={c.communityRules ?? ""}
              className={cn(inputClass, "resize-none")}
              placeholder="Regeln für Beitritts-Zustimmung…"
            />
          </div>

          <PlatformIdGroupsFieldset selected={c.requiredPlatformIds} />

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="admissionsPaused"
                defaultChecked={c.admissionsPaused}
              />
              Aufnahme pausiert
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="requireRulesConsent"
                defaultChecked={c.requireRulesConsent}
              />
              Regeln-Zustimmung erforderlich
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="requireAgeVerification"
                defaultChecked={c.requireAgeVerification}
              />
              Altersprüfung aktivieren
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="waitlistEnabled"
                defaultChecked={c.waitlistEnabled}
              />
              Warteliste bei vollem Limit aktivieren
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="autoRejectAtLimit"
                defaultChecked={c.autoRejectAtLimit}
              />
              Auto-Ablehnung bei vollem Limit
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="autoMessagesEnabled"
                defaultChecked={c.autoMessagesEnabled}
              />
              Automatische Nachrichten
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="paidJoinRequired"
                defaultChecked={c.paidJoinRequired}
              />
              Kostenpflichtige Freischaltung (Stripe vorbereitet)
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="allowRejoinAfterBan"
                defaultChecked={c.allowRejoinAfterBan}
              />
              Rejoin nach Bann erlauben (manuell)
            </label>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">
              Rejoin-Schutz (Tage nach Verlassen)
            </label>
            <input
              name="rejoinCooldownDays"
              type="number"
              min={0}
              defaultValue={c.rejoinCooldownDays ?? ""}
              placeholder="Deaktiviert"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Interne Notizen (Lifecycle)</label>
            <textarea
              name="lifecycleNotes"
              rows={2}
              defaultValue={c.lifecycleNotes ?? ""}
              className={cn(inputClass, "resize-none")}
              placeholder="Interne Notizen zum Community-Status…"
            />
          </div>

          {settingsState?.error && (
            <p className="text-xs text-red-600">{settingsState.error}</p>
          )}

          <button
            type="submit"
            disabled={settingsPending}
            className="w-full rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {settingsPending ? "Speichern…" : "Zugang speichern"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-unze-ink">
          Beitrittsfragen
        </h3>

        {questions.length > 0 && (
          <ul className="mb-4 space-y-2">
            {questions.map((q) => (
              <li
                key={q.id}
                className="flex items-center justify-between rounded-xl bg-unze-surface-muted px-3 py-2 text-xs"
              >
                <span>
                  <strong>{q.label}</strong> · {q.questionType}
                  {q.isRequired && " · Pflicht"}
                </span>
                <button
                  type="button"
                  disabled={deletePending}
                  onClick={() =>
                    startDelete(async () => {
                      await deleteJoinQuestionAction(slug, q.id);
                    })
                  }
                  className="text-red-500"
                  aria-label="Frage löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form action={questionAction} className="space-y-3 border-t border-unze-border pt-4">
          <p className="flex items-center gap-1 text-xs font-medium text-unze-ink">
            <Plus className="h-3.5 w-3.5" /> Neue Frage
          </p>
          <select name="questionType" className={inputClass} defaultValue="text">
            {JOIN_QUESTION_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            name="label"
            required
            placeholder="Frage / Label"
            className={inputClass}
          />
          <input
            name="placeholder"
            placeholder="Platzhalter (optional)"
            className={inputClass}
          />
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="isRequired" defaultChecked />
            Pflichtfeld
          </label>
          {questionState?.error && (
            <p className="text-xs text-red-600">{questionState.error}</p>
          )}
          <button
            type="submit"
            disabled={questionPending}
            className="w-full rounded-xl border border-unze-green py-2 text-sm font-medium text-unze-green"
          >
            Frage hinzufügen
          </button>
        </form>
      </section>
    </div>
  );
}
