import { canReviewApplications } from "@/lib/permissions/engine";
import type { JoinApplicationFileMeta } from "@/types/lifecycle";
import type { CommunityRole } from "@/types/database";
import {
  fetchApplicationProofsFromDb,
  getApplicationProofsWithUrls,
  isProofQuestionType,
  proofsToFileMeta,
  saveApplicationProofInDb,
  uploadApplicationProofs,
} from "./proof.repository";

export {
  isProofQuestionType,
  proofsToFileMeta,
  uploadApplicationProofs,
  fetchApplicationProofsFromDb,
  saveApplicationProofInDb,
};

export async function getProofsForModerator(
  applicationId: string,
  applicantUserId: string,
  actorId: string,
  actorRole: CommunityRole,
) {
  return getApplicationProofsWithUrls({
    applicationId,
    actorRole,
    actorId,
    applicantUserId,
  });
}

export async function persistApplicationProofs(input: {
  applicationId: string;
  uploadedBy: string;
  proofs: JoinApplicationFileMeta[];
}) {
  await Promise.all(
    input.proofs.map((file) =>
      saveApplicationProofInDb({
        applicationId: input.applicationId,
        questionId: file.questionId,
        fileName: file.fileName,
        mimeType: file.mimeType,
        fileSizeBytes: file.fileSizeBytes,
        storagePath: file.storagePath,
        storageBucket: file.storageBucket,
        proofCategory: file.proofCategory,
        uploadedBy: input.uploadedBy,
      }),
    ),
  );
}
