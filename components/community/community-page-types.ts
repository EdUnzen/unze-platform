import type { CommunityTabId } from "@/lib/constants/community-tabs";

export interface CommunityPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    invite?: string;
    joined?: string;
    tab?: string;
    checkout?: string;
  }>;
}

export type { CommunityTabId };
