import type { FeedPost } from "@/lib/mappers/post.mapper";

export function getPostExternalUrl(post: FeedPost): string | null {
  return post.metadata.externalUrl ?? null;
}

export function isExternalContentPost(post: FeedPost): boolean {
  return Boolean(
    post.metadata.externalUrl ||
      post.metadata.contentSource?.startsWith("external"),
  );
}

export function getHostedMedia(post: FeedPost) {
  return post.media.filter((m) => m.source !== "external");
}
