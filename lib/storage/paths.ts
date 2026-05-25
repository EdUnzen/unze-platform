import { STORAGE_BUCKETS, type StorageBucketId } from "@/lib/storage/buckets";
import type { StorageAssetCategory } from "@/types/storage";

export interface BuildPathInput {
  bucket: StorageBucketId;
  communityId?: string;
  userId: string;
  batchId?: string;
  questionId?: string;
  fileName: string;
  category?: StorageAssetCategory;
}

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".")) : "";
  const stem = ext ? base.slice(0, -ext.length) : base;
  return `${stem || "file"}${ext}`.toLowerCase();
}

function randomSuffix(): string {
  return crypto.randomUUID().slice(0, 8);
}

/**
 * Modulare Pfad-Struktur:
 * - join_proofs: {communityId}/{userId}/{batchId}/{questionId}_{suffix}_{filename}
 * - public_media: {userId}/{category}/{suffix}_{filename}
 * - private_media: {communityId}/{userId}/{category}/{suffix}_{filename}
 */
export function buildStoragePath(input: BuildPathInput): string {
  const safeName = sanitizeFileName(input.fileName);
  const suffix = randomSuffix();
  const taggedName = input.questionId
    ? `${input.questionId}_${suffix}_${safeName}`
    : `${suffix}_${safeName}`;

  switch (input.bucket) {
    case STORAGE_BUCKETS.JOIN_PROOFS: {
      if (!input.communityId || !input.batchId) {
        throw new Error("communityId und batchId für JOIN_PROOFS erforderlich");
      }
      return `${input.communityId}/${input.userId}/${input.batchId}/${taggedName}`;
    }
    case STORAGE_BUCKETS.PUBLIC_MEDIA: {
      const cat = input.category ?? "feed_media";
      return `${input.userId}/${cat}/${taggedName}`;
    }
    case STORAGE_BUCKETS.PRIVATE_MEDIA: {
      const cat = input.category ?? "premium_content";
      const community = input.communityId ?? "global";
      return `${community}/${input.userId}/${cat}/${taggedName}`;
    }
    default:
      throw new Error(`Unbekannter Bucket: ${input.bucket}`);
  }
}

export function parseStoragePath(path: string): {
  communityId: string | null;
  userId: string | null;
  batchId: string | null;
  fileName: string;
} {
  const parts = path.split("/");
  if (parts.length >= 4) {
    return {
      communityId: parts[0] ?? null,
      userId: parts[1] ?? null,
      batchId: parts[2] ?? null,
      fileName: parts.slice(3).join("/"),
    };
  }
  return {
    communityId: null,
    userId: parts[0] ?? null,
    batchId: null,
    fileName: parts.slice(1).join("/"),
  };
}
