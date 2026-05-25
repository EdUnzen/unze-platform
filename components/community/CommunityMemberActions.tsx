"use client";

import { joinCommunityAction } from "@/app/community/access-actions";
import {
  leaveCommunityAction,
  toggleFollowCommunity,
} from "@/app/community/actions";
import type { Community } from "@/types/community";
import { cn } from "@/lib/utils/cn";
import { Heart, LogIn, LogOut, UserPlus } from "lucide-react";
import Link from "next/link";
import { useTransition, useState } from "react";

interface CommunityMemberActionsProps {
  community: Community;
  slug: string;
  isLoggedIn: boolean;
}

export function CommunityMemberActions({
  community,
  slug,
  isLoggedIn,
}: CommunityMemberActionsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(community.isFollowing ?? false);
  const [isMember, setIsMember] = useState(
    community.membership?.isMember ?? false,
  );
  const role = community.membership?.role;
  const isCreator = role === "creator";

  if (!isLoggedIn || community.id.startsWith("mock")) {
    return (
      <Link
        href="/auth/login"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-unze-green py-3.5 text-sm font-semibold text-white active:scale-[0.98]"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Anmelden zum Beitreten
      </Link>
    );
  }

  const handleJoinLeave = () => {
    startTransition(async () => {
      setError(null);
      const result = isMember
        ? await leaveCommunityAction(community.id, slug)
        : await joinCommunityAction(community.id, slug);
      if (result.error) {
        setError(result.error);
        return;
      }
      setIsMember(!isMember);
    });
  };

  const handleFollow = () => {
    startTransition(async () => {
      setError(null);
      const result = await toggleFollowCommunity(
        community.id,
        slug,
        following,
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setFollowing(!following);
    });
  };

  return (
    <div className="mt-6 space-y-2">
      {isMember && (
        <div className="rounded-xl bg-unze-green-muted px-3 py-2 text-center text-xs font-semibold text-unze-green-dark">
          {isCreator ? "Du bist Creator" : `Rolle: ${role}`}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {!isCreator && (
          <button
            type="button"
            onClick={handleJoinLeave}
            disabled={pending}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold active:scale-[0.98] disabled:opacity-60",
              isMember
                ? "border border-unze-border bg-white text-unze-ink"
                : "bg-unze-green text-white",
            )}
          >
            {isMember ? (
              <>
                <LogOut className="h-4 w-4" aria-hidden />
                Verlassen
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" aria-hidden />
                Beitreten
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={handleFollow}
          disabled={pending}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-semibold active:scale-[0.98] disabled:opacity-60",
            following
              ? "border-unze-green bg-unze-green-muted text-unze-green-dark"
              : "border-unze-border bg-white text-unze-ink",
            isCreator && "col-span-2",
          )}
        >
          <Heart
            className={cn("h-4 w-4", following && "fill-current")}
            aria-hidden
          />
          {following ? "Gefolgt" : "Folgen"}
        </button>
      </div>

      {error && (
        <p className="text-center text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
