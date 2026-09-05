import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { getPublicStorageUrl } from "@/lib/storage/public-url";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/storage/validation";
import {
  registerAsset,
  uploadBuffer,
} from "@/services/storage/storage.service";

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".")) : "";
  const stem = ext ? base.slice(0, -ext.length) : base;
  return `${stem || "badge"}${ext}`.toLowerCase();
}

export async function uploadCredentialIcon(input: {
  communityId: string;
  userId: string;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<{ iconUrl: string | null; error: string | null }> {
  const mime = input.mimeType.toLowerCase();
  if (!IMAGE_MIME_TYPES.includes(mime as (typeof IMAGE_MIME_TYPES)[number])) {
    return { iconUrl: null, error: "Nur JPG, PNG oder WebP erlaubt." };
  }
  if (input.buffer.byteLength > MAX_IMAGE_BYTES) {
    return { iconUrl: null, error: "Badge-Bild max. 5 MB." };
  }

  const storagePath = `${input.communityId}/credentials/${crypto.randomUUID().slice(0, 8)}_${sanitizeFileName(input.fileName)}`;

  const upload = await uploadBuffer({
    bucket: STORAGE_BUCKETS.PUBLIC_MEDIA,
    path: storagePath,
    buffer: input.buffer,
    contentType: mime,
  });
  if (upload.error) return { iconUrl: null, error: upload.error };

  await registerAsset({
    bucketId: STORAGE_BUCKETS.PUBLIC_MEDIA,
    storagePath,
    ownerId: input.userId,
    communityId: input.communityId,
    assetCategory: "feed_media",
    mimeType: mime,
    fileSizeBytes: input.buffer.byteLength,
    originalName: input.fileName,
  });

  return {
    iconUrl: getPublicStorageUrl(STORAGE_BUCKETS.PUBLIC_MEDIA, storagePath),
    error: null,
  };
}
