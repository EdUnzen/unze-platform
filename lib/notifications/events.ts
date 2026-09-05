/**
 * Unified Notification Events — Governance → Platform Event Bus
 */

import { mapGovernanceToPlatform } from "@/lib/events/mappings";
import { dispatchNotification } from "@/services/notifications/notification-center.service";
import { publishPlatformEvent } from "@/services/platform/event-bus.service";
import type { NotificationCategory } from "@/types/governance";

export type GovernanceNotificationEvent =
  | "strike_received"
  | "member_muted"
  | "member_warned"
  | "member_banned"
  | "member_restored"
  | "report_resolved"
  | "report_dismissed"
  | "community_archived"
  | "community_paused"
  | "role_changed"
  | "invite_received";

const LEGACY_EVENT_COPY: Partial<
  Record<
    GovernanceNotificationEvent,
    { title: string; body?: string; type: string }
  >
> = {
  member_restored: {
    title: "Wiederhergestellt",
    body: "Deine Mitgliedschaft wurde wiederhergestellt.",
    type: "community_event",
  },
  report_resolved: {
    title: "Meldung bearbeitet",
    body: "Eine Meldung wurde bearbeitet.",
    type: "moderation",
  },
  report_dismissed: {
    title: "Meldung abgewiesen",
    type: "moderation",
  },
  invite_received: {
    title: "Einladung erhalten",
    body: "Du wurdest in eine Community eingeladen.",
    type: "invite",
  },
};

export async function notifyGovernanceEvent(input: {
  userId: string;
  category: NotificationCategory;
  event: GovernanceNotificationEvent;
  communityId?: string;
  body?: string;
  title?: string;
  data?: Record<string, unknown>;
  actorId?: string;
  subjectType?: string;
  subjectId?: string;
}) {
  const platformEvent = mapGovernanceToPlatform(input.event);

  if (platformEvent) {
    return publishPlatformEvent({
      eventType: platformEvent,
      actorId: input.actorId ?? null,
      targetUserId: input.userId,
      communityId: input.communityId ?? null,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      notificationTitleOverride: input.title,
      notificationBodyOverride: input.body,
      skipHandlers: ["community-activity"],
      payload: {
        governanceEvent: input.event,
        auditAction: input.data?.auditAction,
        ...input.data,
      },
    });
  }

  const copy = LEGACY_EVENT_COPY[input.event];
  if (!copy) return;

  return dispatchNotification({
    userId: input.userId,
    category: input.category,
    type: copy.type,
    title: copy.title,
    body: input.body ?? copy.body,
    data: {
      event: input.event,
      communityId: input.communityId,
      ...input.data,
    },
  });
}
