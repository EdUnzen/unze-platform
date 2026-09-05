"use client";

import {
  setAwardVisibilityAction,
  type AwardVisibility,
} from "@/app/profile/award-actions";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface AwardVisibilityToggleProps {
  userCredentialId: string;
  visibility: AwardVisibility;
  communitySlug?: string;
}

export function AwardVisibilityToggle({
  userCredentialId,
  visibility: initialVisibility,
  communitySlug,
}: AwardVisibilityToggleProps) {
  const router = useRouter();
  const [visibility, setVisibility] = useState(initialVisibility);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isPublic = visibility === "public";

  function toggle() {
    const next: AwardVisibility = isPublic ? "private" : "public";
    setError(null);
    startTransition(async () => {
      const result = await setAwardVisibilityAction(userCredentialId, next, communitySlug);
      if (result.error) {
        setError(result.error);
        return;
      }
      setVisibility(next);
      router.refresh();
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={
          isPublic
            ? "inline-flex items-center gap-1.5 rounded-full bg-unze-green-muted px-2.5 py-1 text-[11px] font-semibold text-unze-green-dark transition hover:bg-unze-green/15 disabled:opacity-60"
            : "inline-flex items-center gap-1.5 rounded-full bg-unze-surface-muted px-2.5 py-1 text-[11px] font-semibold text-unze-ink-secondary transition hover:bg-unze-border/40 disabled:opacity-60"
        }
        aria-pressed={isPublic}
        title={
          isPublic
            ? "In Community & Profil sichtbar — tippen zum Verbergen"
            : "Verborgen — in Community und Profil nicht sichtbar"
        }
      >
        {isPublic ? (
          <Eye className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <EyeOff className="h-3.5 w-3.5" aria-hidden />
        )}
        {pending ? "…" : isPublic ? "Sichtbar" : "Verborgen"}
      </button>
      {error && (
        <p className="max-w-[8rem] text-right text-[10px] text-red-600">{error}</p>
      )}
    </div>
  );
}
