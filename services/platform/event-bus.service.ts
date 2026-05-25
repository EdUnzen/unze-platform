import { getEventDefinition } from "@/lib/events/catalog";
import { getPlatformEventHandlers } from "@/lib/events/registry";
import type {
  PlatformEventRecord,
  PublishPlatformEventInput,
} from "@/types/events";
import {
  insertEventDeliveryInDb,
  insertPlatformEventInDb,
} from "./event.repository";

import "./handlers";

/**
 * Zentraler Event-Bus — persistiert Events und führt registrierte Handler aus.
 * Vorbereitet für Realtime, Automationen und Analytics.
 */
export async function publishPlatformEvent(
  input: PublishPlatformEventInput,
): Promise<{ error: string | null; eventId?: string; skipped?: boolean }> {
  const definition = getEventDefinition(input.eventType);

  const persisted = await insertPlatformEventInDb({
    eventType: input.eventType,
    domain: definition.domain,
    actorId: input.actorId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    communityId: input.communityId,
    targetUserId: input.targetUserId,
    payload: input.payload,
    correlationId: input.correlationId,
    idempotencyKey: input.idempotencyKey,
  });

  if (persisted.error) return { error: persisted.error };
  if (persisted.skipped) {
    return { error: null, eventId: persisted.id, skipped: true };
  }

  const record: PlatformEventRecord = {
    id: persisted.id!,
    eventType: input.eventType,
    domain: definition.domain,
    actorId: input.actorId ?? null,
    subjectType: input.subjectType ?? null,
    subjectId: input.subjectId ?? null,
    communityId: input.communityId ?? null,
    targetUserId: input.targetUserId ?? null,
    payload: input.payload ?? {},
    correlationId: input.correlationId ?? null,
    createdAt: new Date().toISOString(),
  };

  const skipSet = new Set(input.skipHandlers ?? []);

  for (const handler of getPlatformEventHandlers()) {
    if (skipSet.has(handler.name)) continue;

    try {
      await handler.handle(record, definition, input);
      await insertEventDeliveryInDb({
        eventId: record.id,
        handlerName: handler.name,
        status: "ok",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unbekannter Handler-Fehler";
      console.error(`[event-bus] ${handler.name}:`, message);
      await insertEventDeliveryInDb({
        eventId: record.id,
        handlerName: handler.name,
        status: "error",
        errorMessage: message,
      });
    }
  }

  return { error: null, eventId: record.id };
}
