import { getCurrentUser } from "@/services/auth/auth.service";
import {
  bookEventTicketInDb,
  checkInEventTicketInDb,
  fetchEventTicketStatsFromDb,
  fetchEventTicketsForCommunityFromDb,
  fetchUserEventTicketsFromDb,
  fetchUserTicketForEventFromDb,
} from "./event-ticket.repository";
import { hasCommunityPermission } from "@/lib/permissions/engine";
import type { CommunityRole } from "@/types/database";

export async function getUserEventTickets(userId: string) {
  const tickets = await fetchUserEventTicketsFromDb(userId);
  return { tickets };
}

export async function getUserTicketForEvent(userId: string, eventId: string) {
  const ticket = await fetchUserTicketForEventFromDb(userId, eventId);
  return { ticket };
}

export async function bookEventTicket(eventId: string, communityId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  return bookEventTicketInDb({
    eventId,
    communityId,
    userId: user.id,
  });
}

export async function getEventTicketStats(eventId: string) {
  const stats = await fetchEventTicketStatsFromDb(eventId);
  return { stats };
}

export async function getCommunityEventTickets(
  communityId: string,
  actorRole: CommunityRole,
  eventId?: string,
) {
  if (!hasCommunityPermission(actorRole, "manage_members")) {
    return { error: "Keine Berechtigung", tickets: [] };
  }

  const tickets = await fetchEventTicketsForCommunityFromDb(communityId, eventId);
  return { error: null, tickets };
}

export async function checkInEventTicket(
  ticketCode: string,
  communityId: string,
  actorId: string,
  actorRole: CommunityRole,
) {
  if (!hasCommunityPermission(actorRole, "manage_members")) {
    return { error: "Keine Berechtigung" };
  }

  const result = await checkInEventTicketInDb(ticketCode, actorId);
  if (result.error) return result;

  const tickets = await fetchEventTicketsForCommunityFromDb(communityId);
  const ticket = tickets.find((t) => t.id === result.ticketId);
  if (ticket && ticket.communityId !== communityId) {
    return { error: "Ticket gehört nicht zu dieser Community" };
  }

  return { error: null, ticketId: result.ticketId };
}
