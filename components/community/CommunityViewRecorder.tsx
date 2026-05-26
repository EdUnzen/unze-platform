import { recordCommunityPageView } from "@/services/engagement/engagement.service";

export async function CommunityViewRecorder({
  communityId,
}: {
  communityId: string;
}) {
  await recordCommunityPageView(communityId);
  return null;
}
