/**
 * UNZE Storage — Bucket-Definitionen & Sichtbarkeit
 */

export const STORAGE_BUCKETS = {
  /** Private Bewerbungs-/Verifizierungsnachweise */
  JOIN_PROOFS: "community-join-proofs",
  /** Öffentliche Feed-/Discover-Medien (vorbereitet) */
  PUBLIC_MEDIA: "unze-public-media",
  /** Premium-/Community-private Medien (vorbereitet) */
  PRIVATE_MEDIA: "unze-private-media",
  /** Creator-/Community-Verifizierung (strikt privat) */
  VERIFICATION: "unze-verification-private",
} as const;

export type StorageBucketId =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export interface BucketDefinition {
  id: StorageBucketId;
  public: boolean;
  maxBytes: number;
  description: string;
}

export const BUCKET_DEFINITIONS: Record<StorageBucketId, BucketDefinition> = {
  [STORAGE_BUCKETS.JOIN_PROOFS]: {
    id: STORAGE_BUCKETS.JOIN_PROOFS,
    public: false,
    maxBytes: 10 * 1024 * 1024,
    description: "Private Bewerbungs- und Verifizierungsnachweise",
  },
  [STORAGE_BUCKETS.PUBLIC_MEDIA]: {
    id: STORAGE_BUCKETS.PUBLIC_MEDIA,
    public: true,
    maxBytes: 50 * 1024 * 1024,
    description: "Öffentliche Medien für Feed & Discover",
  },
  [STORAGE_BUCKETS.PRIVATE_MEDIA]: {
    id: STORAGE_BUCKETS.PRIVATE_MEDIA,
    public: false,
    maxBytes: 50 * 1024 * 1024,
    description: "Premium- und Community-private Medien",
  },
  [STORAGE_BUCKETS.VERIFICATION]: {
    id: STORAGE_BUCKETS.VERIFICATION,
    public: false,
    maxBytes: 15 * 1024 * 1024,
    description: "Verifizierungsdokumente — niemals öffentlich",
  },
};

/** Signed-URL Gültigkeit für private Nachweise (Sekunden) */
export const PROOF_SIGNED_URL_TTL = 3600;
