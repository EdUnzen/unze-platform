import { COMMUNITY_ACTIVITY_NOTIFY_TYPES } from "@/lib/notifications/community-activity";
import { registerPlatformEventHandler } from "@/lib/events/registry";
import { notifyCommunityActivitySubscribers } from "@/services/notifications/community-activity.service";

registerPlatformEventHandler({
  name: "community-activity",
  async handle(event, _definition, input) {
    if (!event.communityId) return;
    if (!COMMUNITY_ACTIVITY_NOTIFY_TYPES.has(event.eventType)) return;

    await notifyCommunityActivitySubscribers({
      communityId: event.communityId,
      actorId: input.actorId ?? event.actorId,
      eventType: event.eventType,
      payload: {
        ...event.payload,
        communityTitle: event.payload?.communityTitle ?? event.payload?.title,
      },
    });
  },
});
