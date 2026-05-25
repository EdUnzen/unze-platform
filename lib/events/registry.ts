import type {
  EventDefinition,
  PlatformEventRecord,
  PublishPlatformEventInput,
} from "@/types/events";

export interface PlatformEventHandler {
  name: string;
  handle(
    event: PlatformEventRecord,
    definition: EventDefinition,
    input: PublishPlatformEventInput,
  ): Promise<void>;
}

const handlers: PlatformEventHandler[] = [];

export function registerPlatformEventHandler(handler: PlatformEventHandler) {
  handlers.push(handler);
}

export function getPlatformEventHandlers(): readonly PlatformEventHandler[] {
  return handlers;
}

/** Realtime-Kanal für Supabase Realtime (später aktivieren) */
export function getRealtimeChannelForEvent(
  event: PlatformEventRecord,
): string | null {
  if (event.communityId) {
    return `community:${event.communityId}:events`;
  }
  if (event.targetUserId) {
    return `user:${event.targetUserId}:events`;
  }
  return "platform:events";
}
