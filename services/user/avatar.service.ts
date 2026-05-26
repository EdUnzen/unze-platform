import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { buildStoragePath } from "@/lib/storage/paths";
import { getPublicStorageUrl } from "@/lib/storage/public-url";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/storage/validation";
import {
  registerAsset,
  uploadBuffer,
} from "@/services/storage/storage.service";
import { updateProfile } from "@/services/user/profile.service";

export async function uploadUserAvatar(input: {
  userId: string;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<{ avatarUrl: string | null; error: string | null }> {
  const mime = input.mimeType.toLowerCase();
  if (!IMAGE_MIME_TYPES.includes(mime as (typeof IMAGE_MIME_TYPES)[number])) {
    return { avatarUrl: null, error: "Nur JPG, PNG oder WebP erlaubt." };
  }
  if (input.buffer.byteLength > MAX_IMAGE_BYTES) {
    return { avatarUrl: null, error: "Profilbild max. 5 MB." };
  }

  const path = buildStoragePath({
    bucket: STORAGE_BUCKETS.PUBLIC_MEDIA,
    userId: input.userId,
    fileName: input.fileName,
    category: "avatar",
  });

  const upload = await uploadBuffer({
    bucket: STORAGE_BUCKETS.PUBLIC_MEDIA,
    path,
    buffer: input.buffer,
    contentType: mime,
  });
  if (upload.error) return { avatarUrl: null, error: upload.error };

  await registerAsset({
    bucketId: STORAGE_BUCKETS.PUBLIC_MEDIA,
    storagePath: path,
    ownerId: input.userId,
    assetCategory: "avatar",
    mimeType: mime,
    fileSizeBytes: input.buffer.byteLength,
    originalName: input.fileName,
  });

  const avatarUrl = getPublicStorageUrl(STORAGE_BUCKETS.PUBLIC_MEDIA, path);
  const { error } = await updateProfile(input.userId, { avatar_url: avatarUrl });
  if (error) return { avatarUrl: null, error: error.message };

  return { avatarUrl, error: null };
}
