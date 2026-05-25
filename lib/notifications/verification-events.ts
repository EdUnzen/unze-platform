import { mapVerificationToPlatform } from "@/lib/events/mappings";
import { dispatchNotification } from "@/services/notifications/notification-center.service";
import { publishPlatformEvent } from "@/services/platform/event-bus.service";
import type { VerificationType } from "@/types/verification";

export type VerificationNotificationEvent =
  | "verification_submitted"
  | "verification_approved"
  | "verification_rejected"
  | "verification_reviewing";

const LEGACY_COPY: Record<
  VerificationNotificationEvent,
  { title: string; body?: string }
> = {
  verification_submitted: {
    title: "Verifizierung eingereicht",
    body: "Dein Antrag wird geprüft.",
  },
  verification_approved: {
    title: "Verifizierung freigegeben",
    body: "Glückwunsch — du bist jetzt verifiziert!",
  },
  verification_rejected: {
    title: "Verifizierung abgelehnt",
    body: "Bitte prüfe die Angaben und reiche erneut ein.",
  },
  verification_reviewing: {
    title: "Verifizierung in Prüfung",
    body: "Ein Moderator prüft deine Unterlagen.",
  },
};

export async function notifyVerificationEvent(input: {
  userId: string;
  event: VerificationNotificationEvent;
  requestId: string;
  verificationType: VerificationType;
  communityId?: string;
  body?: string;
  actorId?: string;
  payload?: Record<string, unknown>;
}) {
  const platformEvent = mapVerificationToPlatform(input.event);

  if (platformEvent) {
    return publishPlatformEvent({
      eventType: platformEvent,
      actorId: input.actorId ?? input.userId,
      targetUserId: input.userId,
      communityId: input.communityId ?? null,
      subjectType: "verification_request",
      subjectId: input.requestId,
      notificationBodyOverride: input.body,
      payload: {
        requestId: input.requestId,
        verificationType: input.verificationType,
        verificationEvent: input.event,
        ...input.payload,
      },
    });
  }

  const copy = LEGACY_COPY[input.event];
  return dispatchNotification({
    userId: input.userId,
    category: "system",
    type: "system",
    title: copy.title,
    body: input.body ?? copy.body,
    data: {
      event: input.event,
      requestId: input.requestId,
      verificationType: input.verificationType,
      communityId: input.communityId,
    },
  });
}
