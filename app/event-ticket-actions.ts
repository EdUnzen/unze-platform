"use server";

import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import {
  bookEventTicket,
  cancelEventTicket,
  checkInEventTicket,
} from "@/services/events/event-ticket.service";
import { revalidatePath } from "next/cache";

export async function bookEventTicketAction(
  slug: string,
  eventId: string,
  communityId: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const result = await bookEventTicket(eventId, communityId);
  if (result.error) return { error: result.error };

  revalidatePath(`/community/${slug}/event/${eventId}`);
  revalidatePath("/profile/tickets");
  return { error: null, ticket: result.ticket };
}

export async function checkInEventTicketAction(
  slug: string,
  ticketCode: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { community, canAccess } = await getDashboardCommunityAccess(slug, user.id);
  if (!canAccess || !community) return { error: "Kein Zugriff" };

  const result = await checkInEventTicket(
    ticketCode,
    community.id,
    user.id,
    community.viewerRole,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/events`);
  return { success: true, ticketId: result.ticketId };
}

export async function cancelEventTicketAction(ticketId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const result = await cancelEventTicket(ticketId);
  if (result.error) return { error: result.error };

  revalidatePath("/profile/tickets");
  return { success: true, message: result.message };
}
