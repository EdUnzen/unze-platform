import type { JoinQuestionType } from "@/types/access";
import type { ProofCategory } from "@/types/storage";

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ALL_PROOF_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...DOCUMENT_MIME_TYPES,
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const MAX_AGE_PROOF_BYTES = 8 * 1024 * 1024;

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
  proofCategory?: ProofCategory;
  maxBytes?: number;
}

export function questionTypeToProofCategory(
  questionType: JoinQuestionType,
): ProofCategory {
  switch (questionType) {
    case "image_upload":
      return "image";
    case "file_upload":
      return "document";
    case "age_proof":
      return "age";
    case "identity_proof":
      return "identity";
    default:
      return "generic";
  }
}

export function getAllowedMimeTypes(questionType: JoinQuestionType): readonly string[] {
  switch (questionType) {
    case "image_upload":
      return IMAGE_MIME_TYPES;
    case "age_proof":
      return [...IMAGE_MIME_TYPES, "application/pdf"];
    case "file_upload":
    case "identity_proof":
      return ALL_PROOF_MIME_TYPES;
    default:
      return ALL_PROOF_MIME_TYPES;
  }
}

export function getMaxBytesForQuestion(questionType: JoinQuestionType): number {
  switch (questionType) {
    case "image_upload":
      return MAX_IMAGE_BYTES;
    case "age_proof":
      return MAX_AGE_PROOF_BYTES;
    case "file_upload":
    case "identity_proof":
      return MAX_DOCUMENT_BYTES;
    default:
      return MAX_DOCUMENT_BYTES;
  }
}

export function validateUploadFile(input: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  questionType: JoinQuestionType;
}): UploadValidationResult {
  if (!input.fileName.trim()) {
    return { valid: false, error: "Dateiname fehlt" };
  }

  if (input.sizeBytes <= 0) {
    return { valid: false, error: "Leere Datei" };
  }

  const maxBytes = getMaxBytesForQuestion(input.questionType);
  if (input.sizeBytes > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return {
      valid: false,
      error: `Datei zu groß (max. ${mb} MB)`,
      maxBytes,
    };
  }

  const allowed = getAllowedMimeTypes(input.questionType);
  const mime = input.mimeType.toLowerCase();
  const ext = input.fileName.split(".").pop()?.toLowerCase() ?? "";

  const mimeOk =
    allowed.includes(mime) ||
    (mime === "application/octet-stream" &&
      ((ext === "pdf" && allowed.includes("application/pdf")) ||
        (["jpg", "jpeg", "png", "webp", "heic"].includes(ext) &&
          allowed.some((m) => m.startsWith("image/")))));

  if (!mimeOk) {
    return {
      valid: false,
      error: "Dateityp nicht erlaubt",
    };
  }

  return {
    valid: true,
    proofCategory: questionTypeToProofCategory(input.questionType),
    maxBytes,
  };
}

export function formatMaxSizeHint(questionType: JoinQuestionType): string {
  const max = getMaxBytesForQuestion(questionType);
  const mb = max / (1024 * 1024);
  if (questionType === "image_upload" || questionType === "age_proof") {
    return `JPG, PNG, WebP · max. ${mb} MB`;
  }
  return `PDF, DOC, Bilder · max. ${mb} MB`;
}
