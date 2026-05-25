import { createClient } from "@/lib/supabase/server";
import type { AuditCategory, AuditLogEntry } from "@/types/governance";

export async function insertAuditLogInDb(input: {
  communityId?: string | null;
  actorId?: string | null;
  action: string;
  category: AuditCategory;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      community_id: input.communityId ?? null,
      actor_id: input.actorId ?? null,
      action: input.action,
      category: input.category,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data.id as string };
}

export async function fetchAuditLogsFromDb(
  communityId: string,
  limit = 50,
): Promise<AuditLogEntry[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      `
      id,
      community_id,
      actor_id,
      action,
      category,
      target_type,
      target_id,
      metadata,
      created_at,
      actor:profiles!audit_logs_actor_id_fkey (
        display_name
      )
    `,
    )
    .eq("community_id", communityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[audit.repository]", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const actor = row.actor as { display_name: string | null } | { display_name: string | null }[] | null;
    const actorProfile = Array.isArray(actor) ? actor[0] : actor;
    return {
      id: row.id as string,
      communityId: row.community_id as string | null,
      actorId: row.actor_id as string | null,
      action: row.action as string,
      category: row.category as AuditCategory,
      targetType: row.target_type as string | null,
      targetId: row.target_id as string | null,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.created_at as string,
      actorDisplayName: actorProfile?.display_name ?? null,
    };
  });
}
