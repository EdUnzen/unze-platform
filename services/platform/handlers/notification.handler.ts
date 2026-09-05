import { dispatchNotification } from "@/services/notifications/notification-center.service";
import { fetchCommunitySlugById } from "@/services/community/community.repository";
import { registerPlatformEventHandler } from "@/lib/events/registry";
import { isPersonalMilestoneEnabled } from "@/services/notifications/personal-milestone-prefs.service";
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

async function shouldDeliverPersonalMilestone(
  eventType: PlatformEventRecord["eventType"],
  userId: string,
): Promise<boolean> {
  if (eventType === "badge.granted") {
    return isPersonalMilestoneEnabled(userId, "ownAwards");
  }
  if (eventType === "role.changed") {
    return isPersonalMilestoneEnabled(userId, "ownRoles");
  }
  return true;
}

function resolvePersonalLinkHref(
  event: PlatformEventRecord,
  communitySlug: string | null,
): string | undefined {
  if (event.eventType === "badge.granted") {
    return "/profile/auszeichnungen";
  }
  if (event.eventType === "role.changed" && communitySlug) {
    return `/community/${communitySlug}`;
  }
  return undefined;
}

registerPlatformEventHandler({
  name: "notification",
  async handle(event, definition, input) {
    if (!definition.notification) return;

    const recipients = resolveNotificationRecipients(event, definition, input);
    if (recipients.length === 0) return;

    const title =
      input.notificationTitleOverride ?? definition.notification.title;
    const body =
      input.notificationBodyOverride ?? definition.notification.body;

    const payloadSlug = event.payload?.communitySlug as string | undefined;
    const communitySlug =
      payloadSlug ??
      (event.communityId
        ? await fetchCommunitySlugById(event.communityId)
        : null);

    await Promise.all(
      recipients.map(async (userId) => {
        if (!(await shouldDeliverPersonalMilestone(event.eventType, userId))) {
          return;
        }

        const linkHref = resolvePersonalLinkHref(event, communitySlug);

        return dispatchNotification({
          userId,
          category: definition.notification!.category,
          type: event.eventType,
          title,
          body,
          data: {
            eventType: event.eventType,
            eventId: event.id,
            communityId: event.communityId,
            targetUserId: event.targetUserId,
            ...(communitySlug ? { communitySlug } : {}),
            ...(linkHref ? { linkHref } : {}),
            ...event.payload,
          },
        });
      }),
    );
  },
});
