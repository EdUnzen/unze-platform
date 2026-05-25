"use client";

import { toggleFollowCommunity } from "@/app/community/actions";
import { cn } from "@/lib/utils/cn";
import { Heart } from "lucide-react";
import { useState, useTransition } from "react";

interface FollowCommunityButtonProps {
  communityId: string;
  slug: string;
  initialFollowing: boolean;
  className?: string;
}

export function FollowCommunityButton({
  communityId,
  slug,
  initialFollowing,
  className,
}: FollowCommunityButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      setError(null);
      const result = await toggleFollowCommunity(communityId, slug, following);
      if (result.error) {
        setError(result.error);
        return;
      }
      setFollowing(!following);
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
        {pending ? "…" : following ? "Entfolgen" : "Community folgen"}
      </button>
      {error && (
        <p className="mt-2 text-center text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
