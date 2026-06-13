"use client";

import { toggleFollowGroup } from "@/app/community/actions";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { ACTION_MESSAGES } from "@/lib/constants/action-messages";
import { cn } from "@/lib/utils/cn";
import { Heart } from "lucide-react";
import { useState, useTransition } from "react";

interface FollowGroupButtonProps {
  groupId: string;
  communitySlug: string;
  groupSlug: string;
  initialFollowing: boolean;
  className?: string;
}

export function FollowGroupButton({
  groupId,
  communitySlug,
  groupSlug,
  initialFollowing,
  className,
}: FollowGroupButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await toggleFollowGroup(
        groupId,
        communitySlug,
        groupSlug,
        following,
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setFollowing(!following);
      setSuccess(
        result.message ??
          (following
            ? ACTION_MESSAGES.group.left
            : ACTION_MESSAGES.group.joined),
      );
    });
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60",
          following
            ? "border border-unze-border bg-white text-unze-ink"
            : "bg-unze-green text-white",
        )}
      >
        <Heart
          className={cn("h-4 w-4", following && "fill-unze-green text-unze-green")}
          aria-hidden
        />
        {pending ? "…" : following ? "Gruppe verlassen" : "Gruppe beitreten"}
      </button>
      {success && (
        <ActionFeedback variant="success" className="mt-2">
          {success}
        </ActionFeedback>
      )}
      {error && (
        <ActionFeedback variant="error" className="mt-2">
          {error}
        </ActionFeedback>
      )}
    </div>
  );
}
