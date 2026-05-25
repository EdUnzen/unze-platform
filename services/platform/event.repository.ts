import { createClient } from "@/lib/supabase/server";
import type {
  PlatformEventDomain,
  PlatformEventRecord,
  PlatformEventType,
} from "@/types/events";

export async function insertPlatformEventInDb(input: {
  eventType: PlatformEventType;
  domain: PlatformEventDomain;
  actorId?: string | null;
  subjectType?: string | null;
  subjectId?: string | null;
  communityId?: string | null;
  targetUserId?: string | null;
  payload?: Record<string, unknown>;
  correlationId?: string | null;
  idempotencyKey?: string | null;
}): Promise<{
  error: string | null;
  id?: string;
  skipped?: boolean;
}> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  if (input.idempotencyKey) {
    const { data: existing } = await supabase
      .from("platform_events")
      .select("id")
      .eq("idempotency_key", input.idempotencyKey)
      .maybeSingle();

    if (existing?.id) {
      return { error: null, id: existing.id as string, skipped: true };
    }
  }

  const { data, error } = await supabase
    .from("platform_events")
    .insert({
      event_type: input.eventType,
      domain: input.domain,
      actor_id: input.actorId ?? null,
      subject_type: input.subjectType ?? null,
      subject_id: input.subjectId ?? null,
      community_id: input.communityId ?? null,
      target_user_id: input.targetUserId ?? null,
      payload: input.payload ?? {},
      correlation_id: input.correlationId ?? null,
      idempotency_key: input.idempotencyKey ?? null,
    })
    .select("id, created_at")
    .single();

  if (error) {
    if (input.idempotencyKey && error.code === "23505") {
      const { data: existing } = await supabase
        .from("platform_events")
        .select("id")
        .eq("idempotency_key", input.idempotencyKey)
        .maybeSingle();
      if (existing?.id) {
        return { error: null, id: existing.id as string, skipped: true };
      }
    }
    return { error: error.message };
  }

  return { error: null, id: data.id as string };
}

export async function insertEventDeliveryInDb(input: {
  eventId: string;
  handlerName: string;
  status: "ok" | "error";
  errorMessage?: string;
}) {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase.from("platform_event_deliveries").insert({
    event_id: input.eventId,
    handler_name: input.handlerName,
    status: input.status,
    error_message: input.errorMessage ?? null,
  });
}

export async function fetchPlatformEventsFromDb(input: {
  communityId?: string;
  actorId?: string;
  targetUserId?: string;
  eventTypes?: PlatformEventType[];
  limit?: number;
}): Promise<PlatformEventRecord[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("platform_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 30);

  if (input.communityId) {
    query = query.eq("community_id", input.communityId);
  }
  if (input.actorId) {
    query = query.eq("actor_id", input.actorId);
  }
  if (input.targetUserId) {
    query = query.eq("target_user_id", input.targetUserId);
  }
  if (input.eventTypes?.length) {
    query = query.in("event_type", input.eventTypes);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[event.repository]", error.message);
    return [];
  }

  return (data ?? []).map(mapPlatformEventRow);
}

function mapPlatformEventRow(row: Record<string, unknown>): PlatformEventRecord {
  return {
    id: row.id as string,
    eventType: row.event_type as PlatformEventType,
    domain: row.domain as PlatformEventDomain,
    actorId: row.actor_id as string | null,
    subjectType: row.subject_type as string | null,
    subjectId: row.subject_id as string | null,
    communityId: row.community_id as string | null,
    targetUserId: row.target_user_id as string | null,
    payload: (row.payload as Record<string, unknown>) ?? {},
    correlationId: row.correlation_id as string | null,
    createdAt: row.created_at as string,
  };
}

export async function fetchDiscoverRelevantEventsFromDb(limit = 50) {
  const supabase = await createClient();
  if (!supabase) return [];

  const discoverTypes = [
    "community.created",
    "membership.application_accepted",
    "verification.approved",
    "trust.score_changed",
  ];

  const { data, error } = await supabase
    .from("platform_events")
    .select("*")
    .in("event_type", discoverTypes)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[event.repository] discover", error.message);
    return [];
  }

  return (data ?? []).map(mapPlatformEventRow);
}
