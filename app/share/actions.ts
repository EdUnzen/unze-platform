"use server";

import {
  recordCommunityShare,
  recordGroupShare,
} from "@/services/engagement/engagement.service";
import { revalidatePath } from "next/cache";

export async function recordShareAction(input: {
  type: "community" | "group";
  communityId: string;
  groupId?: string;
  channel: string;
}) {
  if (input.type === "group" && input.groupId) {
    await recordGroupShare(input.groupId);
  } else {
    await recordCommunityShare(input.communityId);
  }

  revalidatePath("/discover");
  revalidatePath("/");

  return { ok: true };
}
