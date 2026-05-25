import { createClient } from "@/lib/supabase/server";
import { canReviewApplications } from "@/lib/permissions/engine";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { validateUploadFile } from "@/lib/storage/validation";
import type { JoinQuestion } from "@/types/access";
import type { JoinApplicationFileMeta } from "@/types/lifecycle";
import type {
  ApplicationProofFile,
  ProofCategory,
  UploadedProofResult,
} from "@/types/storage";
import type { CommunityRole } from "@/types/database";
import {
  buildJoinProofPath,
  getSignedUrl,
  registerAsset,
  uploadBuffer,
} from "./storage.service";

const PROOF_QUESTION_TYPES = new Set([
  "file_upload",
  "image_upload",
  "age_proof",
  "identity_proof",
]);

export function isProofQuestionType(type: string): boolean {
  return PROOF_QUESTION_TYPES.has(type);
}

export async function uploadApplicationProofs(input: {
  communityId: string;
  userId: string;
  questions: JoinQuestion[];
  formData: FormData;
}): Promise<{ error: string | null; proofs: UploadedProofResult[]; batchId: string }> {
  const batchId = crypto.randomUUID();
  const proofs: UploadedProofResult[] = [];

  for (const q of input.questions) {
    if (!isProofQuestionType(q.questionType)) continue;

    const raw = input.formData.get(`q_${q.id}`);
    const hasFile = raw instanceof File && raw.size > 0;

    if (q.isRequired && !hasFile) {
      return {
        error: `Nachweis erforderlich: ${q.label}`,
        proofs: [],
        batchId,
      };
    }

    if (!hasFile) continue;

    const validation = validateUploadFile({
      fileName: raw.name,
      mimeType: raw.type || "application/octet-stream",
      sizeBytes: raw.size,
      questionType: q.questionType,
    });

    if (!validation.valid) {
      return {
        error: `${q.label}: ${validation.error}`,
        proofs: [],
        batchId,
      };
    }

    const storagePath = buildJoinProofPath({
      communityId: input.communityId,
      userId: input.userId,
      batchId,
      questionId: q.id,
      fileName: raw.name,
    });

    const buffer = Buffer.from(await raw.arrayBuffer());
    const upload = await uploadBuffer({
      bucket: STORAGE_BUCKETS.JOIN_PROOFS,
      path: storagePath,
      buffer,
      contentType: raw.type || "application/octet-stream",
    });

    if (upload.error) {
      return { error: `Upload fehlgeschlagen: ${upload.error}`, proofs: [], batchId };
    }

    await registerAsset({
      bucketId: STORAGE_BUCKETS.JOIN_PROOFS,
      storagePath,
      ownerId: input.userId,
      communityId: input.communityId,
      assetCategory: "join_proof",
      mimeType: raw.type || undefined,
      fileSizeBytes: raw.size,
      originalName: raw.name,
    });

    proofs.push({
      questionId: q.id,
      fileName: raw.name,
      mimeType: raw.type || "application/octet-stream",
      fileSizeBytes: raw.size,
      storagePath,
      storageBucket: STORAGE_BUCKETS.JOIN_PROOFS,
      proofCategory: validation.proofCategory ?? "generic",
    });
  }

  return { error: null, proofs, batchId };
}

export function proofsToFileMeta(
  proofs: UploadedProofResult[],
): JoinApplicationFileMeta[] {
  return proofs.map((p) => ({
    questionId: p.questionId,
    fileName: p.fileName,
    mimeType: p.mimeType,
    fileSizeBytes: p.fileSizeBytes,
    storagePath: p.storagePath,
    storageBucket: p.storageBucket,
    proofCategory: p.proofCategory,
  }));
}

export async function fetchApplicationProofsFromDb(
  applicationId: string,
): Promise<ApplicationProofFile[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_join_application_files")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[proof.repository]", error.message);
    return [];
  }

  return (data ?? []).map(mapProofRow);
}

export async function saveApplicationProofInDb(input: {
  applicationId: string;
  questionId: string | null;
  fileName: string;
  mimeType?: string;
  fileSizeBytes?: number;
  storagePath?: string;
  storageBucket?: string;
  proofCategory?: ProofCategory;
  uploadedBy: string;
}): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { error } = await supabase.from("community_join_application_files").insert({
    application_id: input.applicationId,
    question_id: input.questionId,
    file_name: input.fileName,
    mime_type: input.mimeType ?? null,
    file_size_bytes: input.fileSizeBytes ?? null,
    storage_path: input.storagePath ?? null,
    storage_bucket: input.storageBucket ?? STORAGE_BUCKETS.JOIN_PROOFS,
    proof_category: input.proofCategory ?? "generic",
    uploaded_by: input.uploadedBy,
  });

  return !error;
}

export async function getApplicationProofsWithUrls(input: {
  applicationId: string;
  actorRole: CommunityRole;
  actorId: string;
  applicantUserId: string;
}): Promise<{ error: string | null; proofs: ApplicationProofFile[] }> {
  const isApplicant = input.actorId === input.applicantUserId;
  if (!isApplicant && !canReviewApplications(input.actorRole)) {
    return { error: "Keine Berechtigung", proofs: [] };
  }

  const proofs = await fetchApplicationProofsFromDb(input.applicationId);
  const withUrls: ApplicationProofFile[] = [];

  for (const proof of proofs) {
    if (!proof.storagePath) {
      withUrls.push(proof);
      continue;
    }

    const bucket =
      (proof.storageBucket as typeof STORAGE_BUCKETS.JOIN_PROOFS) ??
      STORAGE_BUCKETS.JOIN_PROOFS;
    const signed = await getSignedUrl(bucket, proof.storagePath);
    withUrls.push({
      ...proof,
      signedUrl: signed.signedUrl ?? null,
    });
  }

  return { error: null, proofs: withUrls };
}

function mapProofRow(row: Record<string, unknown>): ApplicationProofFile {
  return {
    id: row.id as string,
    applicationId: row.application_id as string,
    questionId: row.question_id as string | null,
    fileName: row.file_name as string,
    mimeType: row.mime_type as string | null,
    fileSizeBytes: row.file_size_bytes as number | null,
    storageBucket: (row.storage_bucket as string) ?? STORAGE_BUCKETS.JOIN_PROOFS,
    storagePath: row.storage_path as string | null,
    proofCategory: (row.proof_category as ProofCategory) ?? "generic",
    createdAt: row.created_at as string,
  };
}
