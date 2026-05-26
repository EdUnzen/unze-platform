"use server";

import { createPost } from "@/services/feed/feed.service";
import type { PostType } from "@/types/database";
import type { PostMediaItem } from "@/types/post";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseMediaUrls(raw: string, postType: PostType): PostMediaItem[] {
  const urls = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (urls.length === 0) return [];

  const mediaType =
    postType === "video" || postType === "clip" ? "video" : "image";

  return urls.map((url, index) => ({
    type: mediaType,
    url,
    thumbnailUrl: mediaType === "video" ? url : undefined,
    sortOrder: index,
  }));
}

export async function createPostAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const content = String(formData.get("content") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const communityId = String(formData.get("communityId") ?? "").trim();
  const groupId = String(formData.get("groupId") ?? "").trim();
  const postType = (String(formData.get("postType") ?? "text").trim() ||
    "text") as PostType;
  const mediaUrls = String(formData.get("mediaUrls") ?? "");
  const eventAt = String(formData.get("eventAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!content) {
    return { error: "Bitte Inhalt eingeben" };
  }

  if (content.length < 3) {
    return { error: "Mindestens 3 Zeichen" };
  }

  const media = parseMediaUrls(mediaUrls, postType);
  const metadata =
    postType === "event"
      ? {
          ...(eventAt ? { eventAt: new Date(eventAt).toISOString() } : {}),
          ...(location ? { location } : {}),
        }
      : {};

  const { error } = await createPost({
    content,
    title: title || undefined,
    communityId: communityId || undefined,
    groupId: groupId || undefined,
    visibility: "public",
    postType,
    media,
    metadata,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/discover");
  revalidatePath("/");
  redirect("/discover?tab=feed");
}
