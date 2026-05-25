import { createClient } from "@/lib/supabase/server";
import type {
  VerificationDocument,
  VerificationDocumentType,
  VerificationRequest,
  VerificationStatus,
  VerificationSubjectType,
  VerificationType,
  CreatorVerificationTier,
} from "@/types/verification";

export async function fetchProfilePlatformRole(
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("platform_role")
    .eq("id", userId)
    .maybeSingle();

  return (data?.platform_role as string) ?? null;
}

export async function insertVerificationRequestInDb(input: {
  subjectType: VerificationSubjectType;
  subjectId: string;
  verificationType: VerificationType;
  submittedBy: string;
  businessName?: string;
  businessRegistrationId?: string;
  notes?: string;
  status?: VerificationStatus;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("verification_requests")
    .insert({
      subject_type: input.subjectType,
      subject_id: input.subjectId,
      verification_type: input.verificationType,
      submitted_by: input.submittedBy,
      business_name: input.businessName ?? null,
      business_registration_id: input.businessRegistrationId ?? null,
      notes: input.notes ?? null,
      status: input.status ?? "pending",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data.id as string };
}

export async function fetchVerificationRequestById(
  requestId: string,
): Promise<VerificationRequest | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (!data) return null;
  return mapRequestRow(data);
}

export async function fetchUserVerificationRequests(
  userId: string,
): Promise<VerificationRequest[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("submitted_by", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapRequestRow);
}

export async function fetchPendingVerificationRequests(
  limit = 50,
): Promise<VerificationRequest[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("verification_requests")
    .select(
      `
      *,
      submitter:profiles!verification_requests_submitted_by_fkey (display_name)
    `,
    )
    .in("status", ["pending", "reviewing"])
    .order("created_at", { ascending: true })
    .limit(limit);

  return (data ?? []).map((row) => {
    const submitter = row.submitter as
      | { display_name: string | null }
      | { display_name: string | null }[]
      | null;
    const profile = Array.isArray(submitter) ? submitter[0] : submitter;
    return {
      ...mapRequestRow(row),
      submitterDisplayName: profile?.display_name ?? null,
    };
  });
}

export async function fetchCommunityVerificationRequests(
  communityId: string,
): Promise<VerificationRequest[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("subject_type", "community")
    .eq("subject_id", communityId)
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapRequestRow);
}

export async function updateVerificationRequestStatusInDb(input: {
  requestId: string;
  status: VerificationStatus;
  reviewedBy: string;
  rejectionReason?: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("verification_requests")
    .update({
      status: input.status,
      reviewed_by: input.reviewedBy,
      reviewed_at: new Date().toISOString(),
      rejection_reason: input.rejectionReason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.requestId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function insertVerificationDocumentInDb(input: {
  requestId: string;
  documentType: VerificationDocumentType;
  storagePath: string;
  fileName: string;
  mimeType?: string;
  fileSizeBytes?: number;
  uploadedBy: string;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("verification_documents")
    .insert({
      request_id: input.requestId,
      document_type: input.documentType,
      storage_bucket: "unze-verification-private",
      storage_path: input.storagePath,
      file_name: input.fileName,
      mime_type: input.mimeType ?? null,
      file_size_bytes: input.fileSizeBytes ?? null,
      uploaded_by: input.uploadedBy,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data.id as string };
}

export async function fetchVerificationDocuments(
  requestId: string,
): Promise<VerificationDocument[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("verification_documents")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  return (data ?? []).map(mapDocumentRow);
}

export async function insertVerificationAccessLogInDb(input: {
  documentId: string;
  requestId: string;
  accessorId: string;
  action?: string;
}): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase.from("verification_access_logs").insert({
    document_id: input.documentId,
    request_id: input.requestId,
    accessor_id: input.accessorId,
    action: input.action ?? "view",
  });
}

export async function approveCreatorVerificationInDb(input: {
  userId: string;
  tier: "identity" | "business" | "platform";
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("profiles")
    .update({
      is_verified: true,
      is_creator: true,
      creator_verification_tier: input.tier,
      creator_verification_status: "approved",
      verified_creator_at: new Date().toISOString(),
    })
    .eq("id", input.userId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function approveCommunityVerificationInDb(
  communityId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("communities")
    .update({
      is_verified: true,
      community_verification_status: "approved",
      verified_community_at: new Date().toISOString(),
      trust_score: 150,
    })
    .eq("id", communityId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function fetchCreatorVerificationProfile(userId: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select(
      "creator_verification_tier, creator_verification_status, verified_creator_at, is_verified",
    )
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;

  const tier = data.creator_verification_tier as CreatorVerificationTier;
  return {
    tier,
    status: data.creator_verification_status as VerificationStatus,
    verifiedAt: data.verified_creator_at as string | null,
    isVerifiedCreator:
      Boolean(data.verified_creator_at) ||
      (data.is_verified as boolean && tier !== "none"),
  };
}

function mapRequestRow(row: Record<string, unknown>): VerificationRequest {
  return {
    id: row.id as string,
    subjectType: row.subject_type as VerificationSubjectType,
    subjectId: row.subject_id as string,
    verificationType: row.verification_type as VerificationType,
    status: row.status as VerificationStatus,
    submittedBy: row.submitted_by as string,
    businessName: row.business_name as string | null,
    businessRegistrationId: row.business_registration_id as string | null,
    notes: row.notes as string | null,
    rejectionReason: row.rejection_reason as string | null,
    reviewedBy: row.reviewed_by as string | null,
    reviewedAt: row.reviewed_at as string | null,
    expiresAt: row.expires_at as string | null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapDocumentRow(row: Record<string, unknown>): VerificationDocument {
  return {
    id: row.id as string,
    requestId: row.request_id as string,
    documentType: row.document_type as VerificationDocumentType,
    storageBucket: row.storage_bucket as string,
    storagePath: row.storage_path as string,
    fileName: row.file_name as string,
    mimeType: row.mime_type as string | null,
    fileSizeBytes: row.file_size_bytes as number | null,
    uploadedBy: row.uploaded_by as string,
    createdAt: row.created_at as string,
  };
}
