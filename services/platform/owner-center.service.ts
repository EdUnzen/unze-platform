import { createAdminClient } from "@/lib/supabase/admin";
import type { PlatformReport, ReportStatus } from "@/types/governance";
import type { VerificationRequest } from "@/types/verification";

export interface PlatformOverviewStats {
  users: number;
  communities: number;
  groups: number;
  events: number;
  services: number;
}

function adminOrThrow() {
  const admin = createAdminClient();
  if (!admin) throw new Error("Plattformverwaltung nicht verfügbar");
  return admin;
}

export async function fetchPlatformOverviewStats(): Promise<PlatformOverviewStats> {
  const admin = adminOrThrow();

  const [users, communities, groups, events, services] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("communities").select("*", { count: "exact", head: true }),
    admin
      .from("community_groups")
      .select("*", { count: "exact", head: true })
      .eq("group_type", "group"),
    admin.from("community_events").select("*", { count: "exact", head: true }),
    admin
      .from("community_groups")
      .select("*", { count: "exact", head: true })
      .eq("group_type", "service"),
  ]);

  return {
    users: users.count ?? 0,
    communities: communities.count ?? 0,
    groups: groups.count ?? 0,
    events: events.count ?? 0,
    services: services.count ?? 0,
  };
}

function mapReportRow(row: Record<string, unknown>): PlatformReport {
  const reporter = row.reporter as Record<string, unknown> | null;
  return {
    id: row.id as string,
    reporterId: row.reporter_id as string,
    targetType: row.target_type as PlatformReport["targetType"],
    targetId: row.target_id as string,
    communityId: row.community_id as string | null,
    reason: row.reason as string,
    details: row.details as string | null,
    status: row.status as ReportStatus,
    reviewedBy: row.reviewed_by as string | null,
    reviewedAt: row.reviewed_at as string | null,
    resolutionNote: row.resolution_note as string | null,
    createdAt: row.created_at as string,
    reporterDisplayName: (reporter?.display_name as string) ?? null,
    reporterUsername: (reporter?.username as string) ?? null,
  };
}

export async function fetchPlatformReports(
  status?: ReportStatus,
): Promise<PlatformReport[]> {
  const admin = adminOrThrow();

  let query = admin
    .from("platform_reports")
    .select(
      `
      id, reporter_id, target_type, target_id, community_id,
      reason, details, status, reviewed_by, reviewed_at, resolution_note, created_at,
      reporter:profiles!platform_reports_reporter_id_fkey (display_name, username)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("[owner-center] reports:", error.message);
    return [];
  }
  return (data ?? []).map((row) => mapReportRow(row as Record<string, unknown>));
}

export async function updatePlatformReportStatus(input: {
  reportId: string;
  status: "resolved" | "dismissed";
  reviewedBy: string;
  resolutionNote?: string;
}): Promise<{ error: string | null }> {
  const admin = adminOrThrow();
  const { error } = await admin
    .from("platform_reports")
    .update({
      status: input.status,
      reviewed_by: input.reviewedBy,
      reviewed_at: new Date().toISOString(),
      resolution_note: input.resolutionNote ?? null,
    })
    .eq("id", input.reportId);

  if (error) return { error: "Meldung konnte nicht aktualisiert werden." };
  return { error: null };
}

function mapVerificationRequest(row: Record<string, unknown>): VerificationRequest {
  return {
    id: row.id as string,
    subjectType: row.subject_type as VerificationRequest["subjectType"],
    subjectId: row.subject_id as string,
    verificationType: row.verification_type as VerificationRequest["verificationType"],
    status: row.status as VerificationRequest["status"],
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

export async function fetchOwnerVerificationQueue(): Promise<VerificationRequest[]> {
  const admin = adminOrThrow();
  const { data, error } = await admin
    .from("verification_requests")
    .select("*")
    .in("status", ["pending", "reviewing", "approved"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[owner-center] verifications:", error.message);
    return [];
  }
  return (data ?? []).map((row) => mapVerificationRequest(row as Record<string, unknown>));
}

export async function revokeCreatorVerification(userId: string): Promise<{ error: string | null }> {
  const admin = adminOrThrow();
  const { error } = await admin
    .from("profiles")
    .update({
      is_verified: false,
      creator_verification_status: "revoked",
      creator_verification_tier: "none",
    })
    .eq("id", userId);

  if (error) return { error: "Verifizierung konnte nicht entfernt werden." };
  return { error: null };
}

export async function revokeCommunityVerification(
  communityId: string,
): Promise<{ error: string | null }> {
  const admin = adminOrThrow();
  const { error } = await admin
    .from("communities")
    .update({
      is_verified: false,
      community_verification_status: "revoked",
    })
    .eq("id", communityId);

  if (error) return { error: "Verifizierung konnte nicht entfernt werden." };
  return { error: null };
}

export async function setCommunityPlatformSuspended(
  communitySlug: string,
  suspended: boolean,
): Promise<{ error: string | null; title?: string }> {
  const admin = adminOrThrow();
  const { data, error } = await admin
    .from("communities")
    .update({
      access_status: suspended ? "closed" : "open",
      discover_enabled: !suspended,
    })
    .eq("slug", communitySlug.trim())
    .select("title")
    .maybeSingle();

  if (error || !data) {
    return { error: "Community nicht gefunden oder Aktion fehlgeschlagen." };
  }
  return { error: null, title: data.title as string };
}

export async function setCreatorPlatformSuspended(
  username: string,
  suspended: boolean,
): Promise<{ error: string | null; displayName?: string }> {
  const admin = adminOrThrow();
  const { data, error } = await admin
    .from("profiles")
    .update({ platform_suspended: suspended })
    .eq("username", username.trim().replace(/^@/, ""))
    .select("display_name")
    .maybeSingle();

  if (error || !data) {
    return { error: "Creator nicht gefunden oder Aktion fehlgeschlagen." };
  }
  return { error: null, displayName: data.display_name as string };
}
