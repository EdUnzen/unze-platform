import type { PlatformRole } from "@/types/database";

export type VerificationSubjectType = "user" | "community";

export type VerificationType =
  | "creator_identity"
  | "creator_business"
  | "community"
  | "platform";

export type VerificationStatus =
  | "draft"
  | "pending"
  | "reviewing"
  | "approved"
  | "rejected"
  | "expired"
  | "revoked";

export type VerificationDocumentType =
  | "identity_document"
  | "selfie"
  | "business_registration"
  | "tax_certificate"
  | "platform_reference"
  | "community_ownership"
  | "other";

export type CreatorVerificationTier = "none" | "identity" | "business" | "platform";

export interface VerificationRequest {
  id: string;
  subjectType: VerificationSubjectType;
  subjectId: string;
  verificationType: VerificationType;
  status: VerificationStatus;
  submittedBy: string;
  businessName: string | null;
  businessRegistrationId: string | null;
  notes: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  expiresAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  submitterDisplayName?: string | null;
  subjectTitle?: string | null;
}

export interface VerificationDocument {
  id: string;
  requestId: string;
  documentType: VerificationDocumentType;
  storageBucket: string;
  storagePath: string;
  fileName: string;
  mimeType: string | null;
  fileSizeBytes: number | null;
  uploadedBy: string;
  createdAt: string;
  signedUrl?: string | null;
}

export interface VerificationAccessLog {
  id: string;
  documentId: string;
  requestId: string;
  accessorId: string;
  action: string;
  createdAt: string;
}

export interface CreatorVerificationProfile {
  tier: CreatorVerificationTier;
  status: VerificationStatus;
  verifiedAt: string | null;
  isVerifiedCreator: boolean;
}

export interface CommunityVerificationProfile {
  status: VerificationStatus;
  verifiedAt: string | null;
  isVerifiedCommunity: boolean;
}

export interface SubmitCreatorVerificationInput {
  verificationType: "creator_identity" | "creator_business";
  businessName?: string;
  businessRegistrationId?: string;
  notes?: string;
}

export interface SubmitCommunityVerificationInput {
  communityId: string;
  notes?: string;
}
