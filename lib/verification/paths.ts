export const VERIFICATION_BUCKET = "unze-verification-private" as const;

export const VERIFICATION_MAX_BYTES = 15 * 1024 * 1024;

export function buildVerificationStoragePath(input: {
  subjectType: "user" | "community";
  subjectId: string;
  requestId: string;
  documentType: string;
  fileName: string;
}): string {
  const safe = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${input.subjectType}/${input.subjectId}/${input.requestId}/${input.documentType}_${suffix}_${safe}`;
}
