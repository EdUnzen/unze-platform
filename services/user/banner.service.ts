import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { buildStoragePath } from "@/lib/storage/paths";
import { getPublicStorageUrl } from "@/lib/storage/public-url";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/storage/validation";
import {
  registerAsset,
  uploadBuffer,
} from "@/services/storage/storage.service";

const MAX_BANNER_BYTES = 8 * 1024 * 1024;

export async function uploadCommunityBanner(input: {
  userId: string;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<{ bannerUrl: string | null; error: string | null }> {
  const mime = input.mimeType.toLowerCase();
  if (!IMAGE_MIME_TYPES.includes(mime as (typeof IMAGE_MIME_TYPES)[number])) {
    return { bannerUrl: null, error: "Nur JPG, PNG oder WebP erlaubt." };
  }
  if (input.buffer.byteLength > MAX_BANNER_BYTES) {
    return { bannerUrl: null, error: "Banner max. 8 MB." };
  }

  const path = buildStoragePath({
    bucket: STORAGE_BUCKETS.PUBLIC_MEDIA,
    userId: input.userId,
    fileName: input.fileName,
    category: "banner",
  });

  const upload = await uploadBuffer({
    bucket: STORAGE_BUCKETS.PUBLIC_MEDIA,
    path,
    buffer: input.buffer,
    contentType: mime,
  });
  if (upload.error) return { bannerUrl: null, error: upload.error };

  await registerAsset({
    bucketId: STORAGE_BUCKETS.PUBLIC_MEDIA,
    storagePath: path,
    ownerId: input.userId,
    assetCategory: "banner",
    mimeType: mime,
    fileSizeBytes: input.buffer.byteLength,
    originalName: input.fileName,
  });

  return {
    bannerUrl: getPublicStorageUrl(STORAGE_BUCKETS.PUBLIC_MEDIA, path),
    error: null,
  };
}
