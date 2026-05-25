import { logAuditEvent } from "@/services/governance/audit.service";
import { registerPlatformEventHandler } from "@/lib/events/registry";
import type {
  EventDefinition,
  PlatformEventRecord,
  PublishPlatformEventInput,
} from "@/types/events";

registerPlatformEventHandler({
  name: "audit",
  async handle(event, definition, input) {
    if (!definition.audit) return;

    const action =
      (event.payload?.auditAction as string | undefined) ??
      definition.audit.actionTemplate;

    await logAuditEvent({
      communityId: event.communityId,
      actorId: event.actorId,
      action,
      category: definition.audit.category,
      targetType: event.subjectType,
      targetId: event.subjectId,
      metadata: {
        eventId: event.id,
        eventType: event.eventType,
        targetUserId: event.targetUserId,
        ...event.payload,
      },
    });
  },
});
