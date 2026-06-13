export type EventTicketStatus = "active" | "used" | "cancelled";

export interface EventTicketView {
  id: string;
  eventId: string;
  communityId: string;
  userId: string;
  ticketCode: string;
  status: EventTicketStatus;
  bookedAt: string;
  checkedInAt: string | null;
  eventTitle: string;
  eventStartsAt: string;
  eventLocation: string | null;
  communitySlug: string;
  communityTitle: string;
}

export interface EventTicketStats {
  total: number;
  checkedIn: number;
  pending: number;
}
