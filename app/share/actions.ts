"use server";

import {
  recordCommunityShare,
  recordGroupShare,
  recordPostShare,
} from "@/services/engagement/engagement.service";
import { revalidatePath } from "next/cache";

export async function recordShareAction(input: {
  type: "community" | "group" | "post";
  communityId?: string;
  groupId?: string;
  postId?: string;
  channel: string;
}) {
  if (input.type === "post" && input.postId) {
    await recordPostShare(input.postId);
  } else if (input.type === "group" && input.groupId) {
    await recordGroupShare(input.groupId);
  } else if (input.communityId) {
    await recordCommunityShare(input.communityId);
  }

  revalidatePath("/discover");
  revalidatePath("/");
  if (input.postId) revalidatePath(`/post/${input.postId}`);

  return { ok: true };
}
