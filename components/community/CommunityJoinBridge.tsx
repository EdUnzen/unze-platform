"use client";

import { CommunityJoinPanel } from "@/components/community/CommunityJoinPanel";
import { DemoJoinPanel } from "@/components/community/DemoJoinPanel";
import { isMockCommunityId } from "@/lib/demo/mode";
import type { Community } from "@/types/community";
import type { JoinQuestion } from "@/types/access";

interface CommunityJoinBridgeProps {
  community: Community;
  slug: string;
  isLoggedIn: boolean;
  questions?: JoinQuestion[];
  inviteCode?: string;
  demoMode?: boolean;
}

export function CommunityJoinBridge({
  community,
  slug,
  isLoggedIn,
  questions = [],
  inviteCode,
  demoMode = false,
}: CommunityJoinBridgeProps) {
  if (demoMode && isMockCommunityId(community.id)) {
    return (
      <DemoJoinPanel
        community={community}
        slug={slug}
        isLoggedIn={isLoggedIn}
        questions={questions}
      />
    );
  }

  return (
    <CommunityJoinPanel
      community={community}
      slug={slug}
      isLoggedIn={isLoggedIn}
      questions={questions}
      inviteCode={inviteCode}
    />
  );
}
