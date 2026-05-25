/**
 * Zentrale Lifecycle-Benachrichtigungen — delegiert an Platform Event Bus
 */

import { mapLifecycleToPlatform } from "@/lib/events/mappings";
import { publishPlatformEvent } from "@/services/platform/event-bus.service";

export type LifecycleNotificationEvent =
  | "application_received"
  | "application_submitted"
  | "application_accepted"
  | "application_rejected"
  | "application_waitlisted"
  | "invite_accepted"
  | "member_banned"
  | "community_archived";

export async function notifyLifecycleEvent(input: {
  userId: string;
  event: LifecycleNotificationEvent;
  communityId: string;
  bodyOverride?: string;
  data?: Record<string, unknown>;
  skipIfDisabled?: boolean;
  actorId?: string;
  subjectType?: string;
  subjectId?: string;
}) {
  if (input.skipIfDisabled) return;

  return publishPlatformEvent({
    eventType: mapLifecycleToPlatform(input.event),
    actorId: input.actorId ?? null,
    targetUserId: input.userId,
    communityId: input.communityId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    notificationBodyOverride: input.bodyOverride,
    payload: {
      lifecycleEvent: input.event,
      ...input.data,
    },
  });
}

export async function notifyReviewers(input: {
  reviewerIds: string[];
  applicantUserId: string;
  communityId: string;
  autoMessagesEnabled: boolean;
  applicationId?: string;
}) {
  if (!input.autoMessagesEnabled) return;

  const reviewerIds = input.reviewerIds.filter(
    (id) => id !== input.applicantUserId,
  );
  if (reviewerIds.length === 0) return;

  return publishPlatformEvent({
    eventType: "membership.application_received",
    targetUserId: input.applicantUserId,
    communityId: input.communityId,
    subjectType: "join_application",
    subjectId: input.applicationId ?? null,
    notifyUserIds: reviewerIds,
    payload: {
      applicantUserId: input.applicantUserId,
      applicationId: input.applicationId,
    },
  });
}

export async function notifyApplicant(input: {
  userId: string;
  event: LifecycleNotificationEvent;
  communityId: string;
  bodyOverride?: string;
  data?: Record<string, unknown>;
  autoMessagesEnabled: boolean;
  actorId?: string;
  applicationId?: string;
}) {
  if (!input.autoMessagesEnabled) return;

  return notifyLifecycleEvent({
    userId: input.userId,
    event: input.event,
    communityId: input.communityId,
    bodyOverride: input.bodyOverride,
    data: input.data,
    actorId: input.actorId,
    subjectType: "join_application",
    subjectId: input.applicationId,
  });
}
