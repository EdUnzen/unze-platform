import { recordPostPageView } from "@/services/engagement/engagement.service";

export async function PostViewRecorder({ postId }: { postId: string }) {
  await recordPostPageView(postId);
  return null;
}
