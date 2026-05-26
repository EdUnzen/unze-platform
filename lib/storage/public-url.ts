import { getSupabaseUrl } from "@/lib/env";
import type { StorageBucketId } from "@/lib/storage/buckets";

export function getPublicStorageUrl(
  bucket: StorageBucketId,
  path: string,
): string {
  const encoded = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${getSupabaseUrl()}/storage/v1/object/public/${bucket}/${encoded}`;
}
