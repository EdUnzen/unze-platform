import { createClient } from "@/lib/supabase/server";
import type {
  PlatformReport,
  ReportStatus,
  ReportTargetType,
} from "@/types/governance";

export async function insertReportInDb(input: {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  communityId?: string | null;
  reason: string;
  details?: string;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("platform_reports")
    .insert({
      reporter_id: input.reporterId,
      target_type: input.targetType,
      target_id: input.targetId,
      community_id: input.communityId ?? null,
      reason: input.reason,
      details: input.details ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data.id as string };
}

export async function fetchReportsForCommunityFromDb(
  communityId: string,
  status?: ReportStatus,
): Promise<PlatformReport[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("platform_reports")
    .select(
      `
      id,
      reporter_id,
      target_type,
      target_id,
      community_id,
      reason,
      details,
      status,
      reviewed_by,
      reviewed_at,
      resolution_note,
      created_at,
      reporter:profiles!platform_reports_reporter_id_fkey (
        display_name,
        username
      )
    `,
    )
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("[report.repository]", error.message);
    return [];
  }

  return (data ?? []).map(mapReportRow);
}

export async function updateReportStatusInDb(
  reportId: string,
  input: {
    status: ReportStatus;
    reviewedBy: string;
    resolutionNote?: string;
  },
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("platform_reports")
    .update({
      status: input.status,
      reviewed_by: input.reviewedBy,
      reviewed_at: new Date().toISOString(),
      resolution_note: input.resolutionNote ?? null,
    })
    .eq("id", reportId);

  if (error) return { error: error.message };
  return { error: null };
}

function mapReportRow(row: Record<string, unknown>): PlatformReport {
  const reporter = row.reporter as
    | { display_name: string | null; username: string | null }
    | { display_name: string | null; username: string | null }[]
    | null;
  const profile = Array.isArray(reporter) ? reporter[0] : reporter;

  return {
    id: row.id as string,
    reporterId: row.reporter_id as string,
    targetType: row.target_type as ReportTargetType,
    targetId: row.target_id as string,
    communityId: row.community_id as string | null,
    reason: row.reason as string,
    details: row.details as string | null,
    status: row.status as ReportStatus,
    reviewedBy: row.reviewed_by as string | null,
    reviewedAt: row.reviewed_at as string | null,
    resolutionNote: row.resolution_note as string | null,
    createdAt: row.created_at as string,
    reporterDisplayName: profile?.display_name ?? null,
    reporterUsername: profile?.username ?? null,
  };
}

export async function countPendingReportsFromDb(
  communityId: string,
): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("platform_reports")
    .select("id", { count: "exact", head: true })
    .eq("community_id", communityId)
    .eq("status", "pending");

  if (error) return 0;
  return count ?? 0;
}
