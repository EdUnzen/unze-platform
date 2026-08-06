"use client";

import { updateEventCheckInRewardsAction } from "@/app/dashboard/event-actions";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import type { CommunityEvent } from "@/types/event";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface RewardOption {
  id: string;
  label: string;
}

interface EventCheckInRewardsPanelProps {
  slug: string;
  events: CommunityEvent[];
  credentials: RewardOption[];
  groups: RewardOption[];
}

export function EventCheckInRewardsPanel({
  slug,
  events,
  credentials,
  groups,
}: EventCheckInRewardsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (events.length === 0) return null;

  const handleSave = (eventId: string, form: HTMLFormElement) => {
    const formData = new FormData(form);
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await updateEventCheckInRewardsAction(slug, eventId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess("Freischaltung gespeichert");
      router.refresh();
    });
  };

  return (
    <section className="space-y-4 rounded-3xl bg-white p-4 shadow-card">
      <div>
        <h2 className="text-base font-semibold text-unze-ink">
          Freischaltung nach Check-in
        </h2>
        <p className="mt-1 text-sm text-unze-ink-secondary">
          Optional: Auszeichnung vergeben oder private Gruppe freischalten, sobald ein Ticket
          eingecheckt wurde.
        </p>
      </div>

      {events.map((event) => (
        <form
          key={event.id}
          className="rounded-2xl border border-unze-border/70 bg-unze-surface-muted/30 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(event.id, e.currentTarget);
          }}
        >
          <p className="mb-3 text-sm font-medium text-unze-ink">{event.title}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs">
              <span className="mb-1 block text-unze-ink-muted">Auszeichnung</span>
              <select
                name="checkInCredentialId"
                defaultValue={event.checkInCredentialId ?? ""}
                className="w-full rounded-xl border border-unze-border bg-white px-3 py-2 text-sm"
              >
                <option value="">Keine</option>
                {credentials.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs">
              <span className="mb-1 block text-unze-ink-muted">Gruppe freischalten</span>
              <select
                name="checkInGroupId"
                defaultValue={event.checkInGroupId ?? ""}
                className="w-full rounded-xl border border-unze-border bg-white px-3 py-2 text-sm"
              >
                <option value="">Keine</option>
                {groups.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="mt-3 rounded-xl border border-unze-border px-3 py-2 text-xs font-semibold text-unze-ink disabled:opacity-60"
          >
            {pending ? "Speichern…" : "Speichern"}
          </button>
        </form>
      ))}

      {error && <ActionFeedback variant="error">{error}</ActionFeedback>}
      {success && <ActionFeedback variant="success">{success}</ActionFeedback>}
    </section>
  );
}
