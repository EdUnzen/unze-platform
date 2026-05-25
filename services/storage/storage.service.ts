import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { buildStoragePath } from "@/lib/storage/paths";
import { validateUploadFile } from "@/lib/storage/validation";
import type { JoinQuestionType } from "@/types/access";
import type { StorageAssetCategory } from "@/types/storage";
import type { StorageBucketId } from "@/lib/storage/buckets";
import {
  createSignedUrlAdmin,
  createSignedUrlInDb,
  deleteObjectInDb,
  registerStorageAssetInDb,
  uploadObjectInDb,
} from "./storage.repository";

export async function uploadBuffer(input: {
  bucket: StorageBucketId;
  path: string;
  buffer: Buffer;
  contentType: string;
}) {
  return uploadObjectInDb({
    bucket: input.bucket,
    path: input.path,
    body: input.buffer,
    contentType: input.contentType,
  });
}

export async function getSignedUrl(
  bucket: StorageBucketId,
  path: string,
  useAdmin = false,
) {
  if (useAdmin) {
    return createSignedUrlAdmin({ bucket, path });
  }
  return createSignedUrlInDb({ bucket, path });
}

export async function registerAsset(input: {
  bucketId: StorageBucketId;
  storagePath: string;
  ownerId: string;
  communityId?: string | null;
  assetCategory: StorageAssetCategory;
  mimeType?: string;
  fileSizeBytes?: number;
  originalName?: string;
  checksum?: string;
}) {
  return registerStorageAssetInDb({
    bucketId: input.bucketId,
    storagePath: input.storagePath,
    ownerId: input.ownerId,
    communityId: input.communityId,
    assetCategory: input.assetCategory,
    visibility: input.bucketId === STORAGE_BUCKETS.PUBLIC_MEDIA ? "public" : "private",
    mimeType: input.mimeType,
    fileSizeBytes: input.fileSizeBytes,
    originalName: input.originalName,
    checksum: input.checksum,
  });
}

export async function removeObjects(bucket: StorageBucketId, paths: string[]) {
  return deleteObjectInDb({ bucket, paths });
}

export function buildJoinProofPath(input: {
  communityId: string;
  userId: string;
  batchId: string;
  questionId: string;
  fileName: string;
}) {
  return buildStoragePath({
    bucket: STORAGE_BUCKETS.JOIN_PROOFS,
    communityId: input.communityId,
    userId: input.userId,
    batchId: input.batchId,
    questionId: input.questionId,
    fileName: input.fileName,
  });
}

export function validateProofFile(input: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  questionType: JoinQuestionType;
}) {
  return validateUploadFile(input);
}
