import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/db/user-facing-errors";
import type { EventTicketStats, EventTicketView } from "@/types/event-ticket";
import { randomBytes } from "crypto";

function generateTicketCode(): string {
  return `UNZE-${randomBytes(12).toString("hex").toUpperCase()}`;
}

function mapTicketRow(row: Record<string, unknown>): EventTicketView {
  const eventRaw = row.event as Record<string, unknown> | Record<string, unknown>[] | null;
  const event = Array.isArray(eventRaw) ? eventRaw[0] : eventRaw;
  const communityRaw = row.community as Record<string, unknown> | Record<string, unknown>[] | null;
  const community = Array.isArray(communityRaw) ? communityRaw[0] : communityRaw;

  return {
    id: row.id as string,
    eventId: row.event_id as string,
    communityId: row.community_id as string,
    userId: row.user_id as string,
    ticketCode: row.ticket_code as string,
    status: row.status as EventTicketView["status"],
    bookedAt: row.booked_at as string,
    checkedInAt: (row.checked_in_at as string) ?? null,
    eventTitle: (event?.title as string) ?? "Event",
    eventStartsAt: (event?.starts_at as string) ?? "",
    eventLocation: (event?.location as string) ?? null,
    communitySlug: (community?.slug as string) ?? "",
    communityTitle: (community?.title as string) ?? "",
  };
}

const TICKET_SELECT = `
  id,
  event_id,
  community_id,
  user_id,
  ticket_code,
  status,
  booked_at,
  checked_in_at,
  event:community_events!inner (
    title,
    starts_at,
    location
  ),
  community:communities!inner (
    slug,
    title
  )
`;

export async function fetchUserEventTicketsFromDb(
  userId: string,
): Promise<EventTicketView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("event_tickets")
    .select(TICKET_SELECT)
    .eq("user_id", userId)
    .neq("status", "cancelled")
    .order("booked_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    console.error("[event-ticket.repository] user tickets:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapTicketRow(row as Record<string, unknown>));
}

export async function fetchUserTicketForEventFromDb(
  userId: string,
  eventId: string,
): Promise<EventTicketView | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("event_tickets")
    .select(TICKET_SELECT)
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .neq("status", "cancelled")
    .maybeSingle();

  return data ? mapTicketRow(data as Record<string, unknown>) : null;
}

export async function bookEventTicketInDb(input: {
  eventId: string;
  communityId: string;
  userId: string;
}): Promise<{ error: string | null; ticket?: EventTicketView }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const existing = await fetchUserTicketForEventFromDb(input.userId, input.eventId);
  if (existing) {
    return { error: null, ticket: existing };
  }

  const { data: cancelledRow } = await supabase
    .from("event_tickets")
    .select("id")
    .eq("user_id", input.userId)
    .eq("event_id", input.eventId)
    .eq("status", "cancelled")
    .maybeSingle();

  if (cancelledRow) {
    const ticketCode = generateTicketCode();
    const { data: reactivated, error: reactivateErr } = await supabase
      .from("event_tickets")
      .update({
        status: "active",
        ticket_code: ticketCode,
        booked_at: new Date().toISOString(),
        checked_in_at: null,
        checked_in_by: null,
      })
      .eq("id", cancelledRow.id)
      .select(TICKET_SELECT)
      .single();

    if (reactivateErr) return { error: mapDbError(reactivateErr.message) };
    return {
      error: null,
      ticket: mapTicketRow(reactivated as Record<string, unknown>),
    };
  }

  const ticketCode = generateTicketCode();

  const { data, error } = await supabase
    .from("event_tickets")
    .insert({
      event_id: input.eventId,
      community_id: input.communityId,
      user_id: input.userId,
      ticket_code: ticketCode,
      status: "active",
    })
    .select(TICKET_SELECT)
    .single();

  if (error) {
    if (error.code === "23505") {
      const again = await fetchUserTicketForEventFromDb(input.userId, input.eventId);
      if (again) return { error: null, ticket: again };
    }
    return { error: mapDbError(error.message) };
  }

  return { error: null, ticket: mapTicketRow(data as Record<string, unknown>) };
}

export async function fetchEventTicketStatsFromDb(
  eventId: string,
): Promise<EventTicketStats> {
  const supabase = await createClient();
  if (!supabase) return { total: 0, checkedIn: 0, pending: 0 };

  const { count: total, error: totalError } = await supabase
    .from("event_tickets")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .neq("status", "cancelled");

  if (totalError) {
    if (totalError.code === "42P01") return { total: 0, checkedIn: 0, pending: 0 };
    return { total: 0, checkedIn: 0, pending: 0 };
  }

  const { count: checkedIn } = await supabase
    .from("event_tickets")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "used");

  const totalN = total ?? 0;
  const checkedN = checkedIn ?? 0;

  return {
    total: totalN,
    checkedIn: checkedN,
    pending: totalN - checkedN,
  };
}

export async function fetchEventTicketsForCommunityFromDb(
  communityId: string,
  eventId?: string,
): Promise<EventTicketView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("event_tickets")
    .select(TICKET_SELECT)
    .eq("community_id", communityId)
    .neq("status", "cancelled")
    .order("booked_at", { ascending: false });

  if (eventId) {
    query = query.eq("event_id", eventId);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === "42P01") return [];
    return [];
  }

  return (data ?? []).map((row) => mapTicketRow(row as Record<string, unknown>));
}

export async function checkInEventTicketInDb(
  ticketCode: string,
  actorId: string,
): Promise<{ error: string | null; ticketId?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase.rpc("check_in_event_ticket", {
    p_ticket_code: ticketCode.trim().toUpperCase(),
    p_actor_id: actorId,
  });

  if (error) return { error: error.message };
  return { error: null, ticketId: data as string };
}

export async function cancelEventTicketInDb(
  ticketId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data: row, error: fetchErr } = await supabase
    .from("event_tickets")
    .select(
      `
      id,
      user_id,
      status,
      event:community_events!inner ( starts_at )
    `,
    )
    .eq("id", ticketId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { error: "not_found" };
  }

  if (row.user_id !== userId) {
    return { error: "forbidden" };
  }

  if (row.status === "cancelled") {
    return { error: null };
  }

  if (row.status === "used") {
    return { error: "already_used" };
  }

  const eventRaw = row.event as { starts_at: string } | { starts_at: string }[] | null;
  const event = Array.isArray(eventRaw) ? eventRaw[0] : eventRaw;
  if (event?.starts_at && new Date(event.starts_at) <= new Date()) {
    return { error: "event_started" };
  }

  const { error: updateErr } = await supabase
    .from("event_tickets")
    .update({ status: "cancelled" })
    .eq("id", ticketId)
    .eq("user_id", userId);

  if (updateErr) return { error: updateErr.message };
  return { error: null };
}
