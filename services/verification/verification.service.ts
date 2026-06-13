import {
  grantCommunityVerificationTrust,
  grantCreatorVerificationTrust,
  recordVerificationRejected,
} from "@/services/trust/trust.service";
import { isPlatformOwner } from "@/lib/auth/platform-owner";
import { notifyVerificationEvent } from "@/lib/notifications/verification-events";
import {
  COMMUNITY_REQUIRED_DOCS,
  REQUIRED_CREATOR_DOCS,
} from "@/lib/verification/constants";
import type {
  SubmitCommunityVerificationInput,
  SubmitCreatorVerificationInput,
  VerificationDocument,
  VerificationRequest,
  VerificationStatus,
} from "@/types/verification";
import type { CommunityRole, PlatformRole } from "@/types/database";
import {
  approveCommunityVerificationInDb,
  approveCreatorVerificationInDb,
  fetchCommunityVerificationRequests,
  fetchCreatorVerificationProfile,
  fetchPendingVerificationRequests,
  fetchProfilePlatformRole,
  fetchUserVerificationRequests,
  fetchVerificationDocuments,
  fetchVerificationRequestById,
  insertVerificationRequestInDb,
  updateVerificationRequestStatusInDb,
} from "./verification.repository";
import {
  getVerificationDocumentUrl,
  uploadVerificationDocument,
} from "./verification-document.service";

export function isPlatformAdmin(role: PlatformRole | string | null): boolean {
  return isPlatformOwner(role);
}

export async function canUserReviewVerification(
  userId: string,
  request: VerificationRequest,
  communityRole?: CommunityRole | null,
): Promise<boolean> {
  const platformRole = await fetchProfilePlatformRole(userId);
  if (isPlatformAdmin(platformRole)) return true;

  if (
    request.subjectType === "community" &&
    (communityRole === "creator" || communityRole === "admin")
  ) {
    return true;
  }

  return false;
}

export async function getCreatorVerificationStatus(userId: string) {
  return fetchCreatorVerificationProfile(userId);
}

export async function getMyVerificationRequests(userId: string) {
  return fetchUserVerificationRequests(userId);
}

export async function getPendingReviews(userId: string) {
  const platformRole = await fetchProfilePlatformRole(userId);
  if (!isPlatformAdmin(platformRole)) {
    return [];
  }
  return fetchPendingVerificationRequests();
}

export async function submitCreatorVerification(
  userId: string,
  input: SubmitCreatorVerificationInput,
  formData: FormData,
) {
  const existing = await fetchCreatorVerificationProfile(userId);
  if (existing?.isVerifiedCreator && input.verificationType === "creator_identity") {
    return { error: "Bereits als Creator verifiziert" };
  }

  const request = await insertVerificationRequestInDb({
    subjectType: "user",
    subjectId: userId,
    verificationType: input.verificationType,
    submittedBy: userId,
    businessName: input.businessName,
    businessRegistrationId: input.businessRegistrationId,
    notes: input.notes,
    status: "pending",
  });

  if (request.error || !request.id) return { error: request.error ?? "Fehler" };

  const requiredDocs = REQUIRED_CREATOR_DOCS[input.verificationType];

  for (const docType of requiredDocs) {
    const file = formData.get(`doc_${docType}`);
    if (!(file instanceof File) || file.size === 0) {
      return { error: `Pflichtdokument fehlt: ${docType}` };
    }

    const result = await uploadVerificationDocument({
      requestId: request.id,
      subjectType: "user",
      subjectId: userId,
      documentType: docType,
      file,
      uploadedBy: userId,
    });

    if (result.error) return { error: result.error };
  }

  const optionalSelfie = formData.get("doc_selfie");
  if (optionalSelfie instanceof File && optionalSelfie.size > 0) {
    await uploadVerificationDocument({
      requestId: request.id,
      subjectType: "user",
      subjectId: userId,
      documentType: "selfie",
      file: optionalSelfie,
      uploadedBy: userId,
    });
  }

  await notifyVerificationEvent({
    userId,
    event: "verification_submitted",
    requestId: request.id,
    verificationType: input.verificationType,
    payload: {
      auditAction: `Creator-Verifizierung eingereicht (${input.verificationType})`,
    },
  });

  return { error: null, requestId: request.id };
}

export async function submitCommunityVerification(
  userId: string,
  input: SubmitCommunityVerificationInput,
  formData: FormData,
) {
  const request = await insertVerificationRequestInDb({
    subjectType: "community",
    subjectId: input.communityId,
    verificationType: "community",
    submittedBy: userId,
    notes: input.notes,
    status: "pending",
  });

  if (request.error || !request.id) return { error: request.error ?? "Fehler" };

  for (const docType of COMMUNITY_REQUIRED_DOCS) {
    const file = formData.get(`doc_${docType}`);
    if (!(file instanceof File) || file.size === 0) {
      return { error: `Pflichtdokument fehlt: ${docType}` };
    }

    const result = await uploadVerificationDocument({
      requestId: request.id,
      subjectType: "community",
      subjectId: input.communityId,
      documentType: docType,
      file,
      uploadedBy: userId,
    });

    if (result.error) return { error: result.error };
  }

  await notifyVerificationEvent({
    userId,
    event: "verification_submitted",
    requestId: request.id,
    verificationType: "community",
    communityId: input.communityId,
    payload: {
      auditAction: "Community-Verifizierung eingereicht",
    },
  });

  return { error: null, requestId: request.id };
}

export async function reviewVerificationRequest(input: {
  requestId: string;
  reviewerId: string;
  action: "approve" | "reject" | "reviewing";
  rejectionReason?: string;
  communityRole?: CommunityRole | null;
}) {
  const request = await fetchVerificationRequestById(input.requestId);
  if (!request) return { error: "Antrag nicht gefunden" };

  const canReview = await canUserReviewVerification(
    input.reviewerId,
    request,
    input.communityRole,
  );
  if (!canReview) return { error: "Keine Berechtigung" };

  const status: VerificationStatus =
    input.action === "approve"
      ? "approved"
      : input.action === "reject"
        ? "rejected"
        : "reviewing";

  const update = await updateVerificationRequestStatusInDb({
    requestId: input.requestId,
    status,
    reviewedBy: input.reviewerId,
    rejectionReason: input.rejectionReason,
  });

  if (update.error) return update;

  if (status === "approved") {
    if (request.verificationType === "creator_identity") {
      await approveCreatorVerificationInDb({ userId: request.subjectId, tier: "identity" });
      await grantCreatorVerificationTrust({
        userId: request.subjectId,
        tier: "identity",
        reviewerId: input.reviewerId,
      });
    } else if (request.verificationType === "creator_business") {
      await approveCreatorVerificationInDb({ userId: request.subjectId, tier: "business" });
      await grantCreatorVerificationTrust({
        userId: request.subjectId,
        tier: "business",
        reviewerId: input.reviewerId,
      });
    } else if (request.verificationType === "community") {
      await approveCommunityVerificationInDb(request.subjectId);
      await grantCommunityVerificationTrust({
        communityId: request.subjectId,
        reviewerId: input.reviewerId,
      });
    } else if (request.verificationType === "platform") {
      await approveCreatorVerificationInDb({ userId: request.subjectId, tier: "platform" });
      await grantCreatorVerificationTrust({
        userId: request.subjectId,
        tier: "platform",
        reviewerId: input.reviewerId,
      });
    }

    await notifyVerificationEvent({
      userId: request.submittedBy,
      event: "verification_approved",
      requestId: request.id,
      verificationType: request.verificationType,
      communityId:
        request.subjectType === "community" ? request.subjectId : undefined,
      actorId: input.reviewerId,
      payload: {
        auditAction: `Verifizierung approved: ${request.verificationType}`,
        status,
      },
    });
  } else if (status === "rejected") {
    await recordVerificationRejected({
      userId: request.submittedBy,
      communityId:
        request.subjectType === "community" ? request.subjectId : null,
      reason: input.rejectionReason,
    });

    await notifyVerificationEvent({
      userId: request.submittedBy,
      event: "verification_rejected",
      requestId: request.id,
      verificationType: request.verificationType,
      body: input.rejectionReason,
      actorId: input.reviewerId,
      communityId:
        request.subjectType === "community" ? request.subjectId : undefined,
      payload: {
        auditAction: `Verifizierung rejected: ${request.verificationType}`,
        rejectionReason: input.rejectionReason,
        status,
      },
    });
  }

  return { error: null };
}

export async function getVerificationDocumentsForReview(input: {
  requestId: string;
  accessorId: string;
  request: VerificationRequest;
  communityRole?: CommunityRole | null;
}): Promise<{ error: string | null; documents: VerificationDocument[] }> {
  const canReview = await canUserReviewVerification(
    input.accessorId,
    input.request,
    input.communityRole,
  );
  const isOwner = input.request.submittedBy === input.accessorId;
  if (!canReview && !isOwner) {
    return { error: "Keine Berechtigung", documents: [] };
  }

  const documents = await fetchVerificationDocuments(input.requestId);
  const withUrls = await Promise.all(
    documents.map(async (doc) => {
      const url = await getVerificationDocumentUrl({
        documentId: doc.id,
        requestId: doc.requestId,
        storagePath: doc.storagePath,
        accessorId: input.accessorId,
      });
      return { ...doc, signedUrl: url.signedUrl ?? null };
    }),
  );

  return { error: null, documents: withUrls };
}

export { fetchCommunityVerificationRequests };
