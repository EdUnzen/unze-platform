import { dispatchNotification } from "@/services/notifications/notification-center.service";
import { fetchCommunitySlugById } from "@/services/community/community.repository";
import { registerPlatformEventHandler } from "@/lib/events/registry";
import type {
  EventDefinition,
  PlatformEventRecord,
  PublishPlatformEventInput,
} from "@/types/events";

function resolveNotificationRecipients(
  event: PlatformEventRecord,
  definition: EventDefinition,
  input: PublishPlatformEventInput,
): string[] {
  const recipients = new Set<string>();

  for (const id of input.notifyUserIds ?? []) {
    if (id) recipients.add(id);
  }

  if (definition.notification?.notifyTarget && event.targetUserId) {
    recipients.add(event.targetUserId);
  }

  return [...recipients];
}

registerPlatformEventHandler({
  name: "notification",
  async handle(event, definition, input) {
    if (!definition.notification) return;

    const recipients = resolveNotificationRecipients(event, definition, input);
    if (recipients.length === 0) return;

    const body =
      input.notificationBodyOverride ?? definition.notification.body;

    const payloadSlug = event.payload?.communitySlug as string | undefined;
    const communitySlug =
      payloadSlug ??
      (event.communityId
        ? await fetchCommunitySlugById(event.communityId)
        : null);

    await Promise.all(
      recipients.map((userId) =>
        dispatchNotification({
          userId,
          category: definition.notification!.category,
          type: event.eventType,
          title: definition.notification!.title,
          body,
          data: {
            eventType: event.eventType,
            eventId: event.id,
            communityId: event.communityId,
            ...(communitySlug ? { communitySlug } : {}),
            ...event.payload,
          },
        }),
      ),
    );
  },
});
