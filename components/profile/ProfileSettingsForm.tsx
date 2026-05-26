"use client";

import { updateProfileAction } from "@/app/profile/actions";
import { ProfileAvatarUpload } from "@/components/profile/ProfileAvatarUpload";
import { cn } from "@/lib/utils/cn";
import { useTransition } from "react";

interface ProfileSettingsFormProps {
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl?: string | null;
}

export function ProfileSettingsForm({
  userId,
  displayName,
  bio,
  avatarUrl,
}: ProfileSettingsFormProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <ProfileAvatarUpload
        userId={userId}
        displayName={displayName}
        avatarUrl={avatarUrl}
      />

      <form
        className="space-y-4"
        action={(formData) => {
          startTransition(async () => {
            await updateProfileAction(formData);
          });
        }}
      >
        <div>
          <label htmlFor="displayName" className="mb-1 block text-xs font-medium text-unze-ink-secondary">
            Anzeigename
          </label>
          <input
            id="displayName"
            name="displayName"
            defaultValue={displayName}
            maxLength={80}
            className="w-full rounded-2xl border border-unze-border px-3 py-2.5 text-sm outline-none focus:border-unze-green"
          />
        </div>
        <div>
          <label htmlFor="bio" className="mb-1 block text-xs font-medium text-unze-ink-secondary">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={bio}
            rows={3}
            maxLength={280}
            placeholder="Kurz über dich…"
            className="w-full resize-none rounded-2xl border border-unze-border px-3 py-2.5 text-sm outline-none focus:border-unze-green"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "w-full rounded-2xl bg-unze-green py-3 text-sm font-semibold text-white",
            "disabled:opacity-60 active:scale-[0.98]",
          )}
        >
          {pending ? "Speichern…" : "Profil speichern"}
        </button>
      </form>
    </div>
  );
}
