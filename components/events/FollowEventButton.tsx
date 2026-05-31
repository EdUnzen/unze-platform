"use client";

import { toggleFollowEvent } from "@/app/community/actions";
import { cn } from "@/lib/utils/cn";
import { Heart } from "lucide-react";
import { useState, useTransition } from "react";

interface FollowEventButtonProps {
  eventId: string;
  communitySlug: string;
  initialFollowing: boolean;
}

export function FollowEventButton({
  eventId,
  communitySlug,
  initialFollowing,
}: FollowEventButtonProps) {
  const [pending, startTransition] = useTransition();
  const [following, setFollowing] = useState(initialFollowing);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleFollowEvent(eventId, communitySlug, following);
          if (!result.error) setFollowing(!following);
        })
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold",
        following
          ? "border-unze-green bg-unze-green-muted text-unze-green-dark"
          : "border-unze-border text-unze-ink",
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", following && "fill-current")} />
      {following ? "Favorit" : "Merken"}
    </button>
  );
}
