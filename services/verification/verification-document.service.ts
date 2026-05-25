import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { validateUploadFile } from "@/lib/storage/validation";
import {
  buildVerificationStoragePath,
  VERIFICATION_MAX_BYTES,
} from "@/lib/verification/paths";
import type { VerificationDocumentType } from "@/types/verification";
import { getSignedUrl, registerAsset, uploadBuffer } from "@/services/storage/storage.service";
import {
  insertVerificationAccessLogInDb,
  insertVerificationDocumentInDb,
} from "./verification.repository";

export async function uploadVerificationDocument(input: {
  requestId: string;
  subjectType: "user" | "community";
  subjectId: string;
  documentType: VerificationDocumentType;
  file: File;
  uploadedBy: string;
}): Promise<{ error: string | null; documentId?: string; storagePath?: string }> {
  if (input.file.size > VERIFICATION_MAX_BYTES) {
    return { error: "Datei zu groß (max. 15 MB)" };
  }

  const validation = validateUploadFile({
    fileName: input.file.name,
    mimeType: input.file.type || "application/octet-stream",
    sizeBytes: input.file.size,
    questionType: "identity_proof",
  });

  if (!validation.valid) {
    return { error: validation.error ?? "Ungültige Datei" };
  }

  const storagePath = buildVerificationStoragePath({
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    requestId: input.requestId,
    documentType: input.documentType,
    fileName: input.file.name,
  });

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const upload = await uploadBuffer({
    bucket: STORAGE_BUCKETS.VERIFICATION,
    path: storagePath,
    buffer,
    contentType: input.file.type || "application/octet-stream",
  });

  if (upload.error) return { error: upload.error };

  await registerAsset({
    bucketId: STORAGE_BUCKETS.VERIFICATION,
    storagePath,
    ownerId: input.uploadedBy,
    communityId: input.subjectType === "community" ? input.subjectId : null,
    assetCategory: "creator_verification",
    mimeType: input.file.type || undefined,
    fileSizeBytes: input.file.size,
    originalName: input.file.name,
  });

  const doc = await insertVerificationDocumentInDb({
    requestId: input.requestId,
    documentType: input.documentType,
    storagePath,
    fileName: input.file.name,
    mimeType: input.file.type || undefined,
    fileSizeBytes: input.file.size,
    uploadedBy: input.uploadedBy,
  });

  if (doc.error) return { error: doc.error };
  return { error: null, documentId: doc.id, storagePath };
}

export async function getVerificationDocumentUrl(input: {
  documentId: string;
  requestId: string;
  storagePath: string;
  accessorId: string;
}): Promise<{ error: string | null; signedUrl?: string }> {
  const signed = await getSignedUrl(STORAGE_BUCKETS.VERIFICATION, input.storagePath);

  if (signed.error) return { error: signed.error };

  await insertVerificationAccessLogInDb({
    documentId: input.documentId,
    requestId: input.requestId,
    accessorId: input.accessorId,
    action: "view",
  });

  return { error: null, signedUrl: signed.signedUrl };
}
