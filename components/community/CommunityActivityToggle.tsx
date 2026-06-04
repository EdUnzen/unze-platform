"use client";

import { setCommunityActivityPrefAction } from "@/app/community/activity-actions";
import { cn } from "@/lib/utils/cn";
import { Bell } from "lucide-react";
import { useState, useTransition } from "react";

interface CommunityActivityToggleProps {
  communityId: string;
  initialEnabled?: boolean;
  className?: string;
}

export function CommunityActivityToggle({
  communityId,
  initialEnabled = true,
  className,
}: CommunityActivityToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border border-unze-border/80 bg-unze-surface-muted/30 p-3",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={enabled}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked;
          setEnabled(next);
          startTransition(async () => {
            await setCommunityActivityPrefAction(communityId, next);
          });
        }}
        className="mt-0.5 h-4 w-4 rounded border-unze-border text-unze-green"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-medium text-unze-ink">
          <Bell className="h-3.5 w-3.5 text-unze-green" aria-hidden />
          Community-Aktivitäten
        </span>
        <span className="mt-0.5 block text-xs text-unze-ink-secondary">
          Wichtige Events, Gruppen und Ankündigungen erscheinen unter Benachrichtigungen
          (kein Handy-Push).
        </span>
      </span>
    </label>
  );
}
