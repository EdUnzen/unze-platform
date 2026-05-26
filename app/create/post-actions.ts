"use server";

import { createPost } from "@/services/feed/feed.service";
import {
  isExternalPlatformUrl,
  resolveExternalContent,
  shouldTreatAsExternalLink,
} from "@/lib/external/resolve-external-content";
import type { PostType } from "@/types/database";
import type { PostMediaItem, PostMetadata } from "@/types/post";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseHostedMediaUrls(raw: string, postType: PostType): PostMediaItem[] {
  const urls = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const media: PostMediaItem[] = [];

  for (const url of urls) {
    if (shouldTreatAsExternalLink(url)) continue;

    const mediaType =
      postType === "video" || postType === "clip" ? "video" : "image";

    media.push({
      type: mediaType,
      url,
      thumbnailUrl: mediaType === "video" ? url : undefined,
      sortOrder: media.length,
      source: "hosted",
    });
  }

  return media;
}

function buildMetadata(input: {
  postType: PostType;
  externalUrl: string;
  mediaUrls: string;
  eventAt: string;
  location: string;
}): PostMetadata {
  const metadata: PostMetadata = {};

  if (input.postType === "event") {
    if (input.eventAt) metadata.eventAt = new Date(input.eventAt).toISOString();
    if (input.location) metadata.location = input.location;
  }

  const primaryExternal =
    input.externalUrl ||
    input.mediaUrls
      .split("\n")
      .map((l) => l.trim())
      .find((url) => url && isExternalPlatformUrl(url));

  if (primaryExternal) {
    const resolved = resolveExternalContent(primaryExternal);
    if (resolved) {
      metadata.externalUrl = resolved.originalUrl;
      metadata.externalPlatform = resolved.platform;
      metadata.contentSource =
        resolved.mode === "iframe" ? "external_embed" : "external_link";
    }
  }

  return metadata;
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
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const eventAt = String(formData.get("eventAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!content) {
    return { error: "Bitte Inhalt eingeben" };
  }

  if (content.length < 3) {
    return { error: "Mindestens 3 Zeichen" };
  }

  const metadata = buildMetadata({ postType, externalUrl, mediaUrls, eventAt, location });
  const media = parseHostedMediaUrls(mediaUrls, postType);

  if (
    (postType === "video" || postType === "clip") &&
    !metadata.externalUrl &&
    media.length === 0
  ) {
    return {
      error:
        "Für Clips/Videos bitte einen externen Link (YouTube, TikTok, …) angeben — UNZE hostet keine fremden Videos neu.",
    };
  }

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
