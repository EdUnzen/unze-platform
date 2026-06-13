import { EventDetailView } from "@/components/events/EventDetailView";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getCommunityBySlug } from "@/services/community/community.service";
import { getCommunityEventByIdOrSlug } from "@/services/events/event.service";
import { getUserTicketForEvent } from "@/services/events/event-ticket.service";
import { getFollowedEventIdsAmong } from "@/services/follow/follow.service";
import { notFound } from "next/navigation";

interface EventDetailPageProps {
  params: Promise<{ slug: string; eventId: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug, eventId } = await params;
  const [community, event, user] = await Promise.all([
    getCommunityBySlug(slug),
    getCommunityEventByIdOrSlug(slug, eventId),
    getCurrentUser(),
  ]);

  if (!community || !event) notFound();

  const followed =
    user && event
      ? await getFollowedEventIdsAmong([event.id])
      : [];

  const userTicket = user
    ? (await getUserTicketForEvent(user.id, event.id)).ticket
    : null;

  return (
    <EventDetailView
      community={community}
      event={event}
      isLoggedIn={Boolean(user)}
      initialFollowing={followed.includes(event.id)}
      userTicket={userTicket}
    />
  );
}
