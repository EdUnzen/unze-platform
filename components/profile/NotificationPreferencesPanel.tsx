"use client";

import { saveNotificationPrefsAction } from "@/app/profile/notification-actions";
import { ActionSuccessBanner } from "@/components/ui/ActionSuccessBanner";
import type { NotificationPreferences } from "@/types/governance";
import { cn } from "@/lib/utils/cn";
import { Bell } from "lucide-react";
import { useState, useTransition } from "react";

type PrefsForm = NotificationPreferences & {
  newGroups: boolean;
  newServices: boolean;
  newPosts: boolean;
  newReviews: boolean;
  communityUpdates: boolean;
  monetizationChanges: boolean;
  creatorReferrals: boolean;
};

interface NotificationPreferencesPanelProps {
  userId: string;
  initial: PrefsForm;
}

function ToggleRow({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-unze-border/80 p-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-unze-border text-unze-green"
      />
      <span>
        <span className="block text-sm font-medium text-unze-ink">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-unze-ink-secondary">{description}</span>
        )}
      </span>
    </label>
  );
}

export function NotificationPreferencesPanel({
  userId,
  initial,
}: NotificationPreferencesPanelProps) {
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-3xl border border-unze-border/80 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-5 w-5 text-unze-green" aria-hidden />
        <h2 className="text-sm font-semibold text-unze-ink">Benachrichtigungen</h2>
      </div>
      <p className="mb-4 text-xs text-unze-ink-secondary">
        Push-Versand folgt — Einstellungen werden bereits gespeichert.
      </p>

      <form
        className="space-y-2"
        action={(formData) => {
          startTransition(async () => {
            const result = await saveNotificationPrefsAction(userId, formData);
            if (!result.error) setSuccess(true);
          });
        }}
      >
        <ToggleRow
          name="communityEvents"
          label="Neue Events"
          description="z. B. „Community X hat ein neues Event erstellt“"
          defaultChecked={initial.communityEvents}
        />
        <ToggleRow
          name="newGroups"
          label="Neue Gruppen"
          defaultChecked={initial.newGroups}
        />
        <ToggleRow
          name="newServices"
          label="Neue Services"
          defaultChecked={initial.newServices}
        />
        <ToggleRow
          name="newPosts"
          label="Neue Beiträge"
          defaultChecked={initial.newPosts}
        />
        <ToggleRow
          name="newReviews"
          label="Neue Bewertungen"
          defaultChecked={initial.newReviews}
        />
        <ToggleRow
          name="communityUpdates"
          label="Community-Updates"
          defaultChecked={initial.communityUpdates}
        />
        <ToggleRow
          name="monetizationChanges"
          label="Monetarisierungsänderungen"
          defaultChecked={initial.monetizationChanges}
        />
        <ToggleRow
          name="creatorReferrals"
          label="Creator-Benachrichtigungen"
          description="z. B. neuer Crowd Partner"
          defaultChecked={initial.creatorReferrals}
        />
        <ToggleRow
          name="applications"
          label="Beitrittsanträge"
          defaultChecked={initial.applications}
        />
        <ToggleRow
          name="invites"
          label="Einladungen"
          defaultChecked={initial.invites}
        />
        <ToggleRow
          name="moderation"
          label="Moderation"
          defaultChecked={initial.moderation}
        />
        <ToggleRow
          name="pushEnabled"
          label="Push-Benachrichtigungen (vorbereitet)"
          description="Aktivierung folgt mit PWA-Push"
          defaultChecked={initial.pushEnabled}
        />

        {success && <ActionSuccessBanner message="Einstellungen gespeichert" className="mt-3" />}

        <button
          type="submit"
          disabled={pending}
          className={cn(
            "mt-3 w-full rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white",
            "disabled:opacity-60",
          )}
        >
          {pending ? "Speichern…" : "Benachrichtigungen speichern"}
        </button>
      </form>
    </section>
  );
}
