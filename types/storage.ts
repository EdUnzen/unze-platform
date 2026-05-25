export type ProofCategory =
  | "image"
  | "document"
  | "age"
  | "identity"
  | "creator"
  | "community"
  | "generic";

export type StorageAssetCategory =
  | "join_proof"
  | "feed_media"
  | "premium_content"
  | "avatar"
  | "banner"
  | "creator_verification";

export type StorageVisibility = "private" | "community" | "public";

export interface StorageAsset {
  id: string;
  bucketId: string;
  storagePath: string;
  ownerId: string;
  communityId: string | null;
  assetCategory: StorageAssetCategory;
  visibility: StorageVisibility;
  mimeType: string | null;
  fileSizeBytes: number | null;
  originalName: string | null;
  checksum: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ApplicationProofFile {
  id: string;
  applicationId: string;
  questionId: string | null;
  fileName: string;
  mimeType: string | null;
  fileSizeBytes: number | null;
  storageBucket: string;
  storagePath: string | null;
  proofCategory: ProofCategory;
  createdAt: string;
  signedUrl?: string | null;
}

export interface UploadedProofResult {
  questionId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  storagePath: string;
  storageBucket: string;
  proofCategory: ProofCategory;
  checksum?: string;
}
