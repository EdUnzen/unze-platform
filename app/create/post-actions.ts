"use server";

import { createPost } from "@/services/feed/feed.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPostAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const content = String(formData.get("content") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const communityId = String(formData.get("communityId") ?? "").trim();

  if (!content) {
    return { error: "Bitte Inhalt eingeben" };
  }

  if (content.length < 3) {
    return { error: "Mindestens 3 Zeichen" };
  }

  const { error } = await createPost({
    content,
    title: title || undefined,
    communityId: communityId || undefined,
    visibility: communityId ? "community" : "public",
    postType: "text",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/discover");
  revalidatePath("/");
  redirect("/discover?tab=feed");
}
