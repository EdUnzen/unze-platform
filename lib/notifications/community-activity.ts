import type { PlatformEventType } from "@/types/events";

/** Wichtige Community-Ereignisse — kein Spam */
export const COMMUNITY_ACTIVITY_NOTIFY_TYPES = new Set<PlatformEventType>([
  "community.event_published",
  "community.group_created",
  "community.service_created",
  "community.update_published",
  "community.premium_scheduled",
  "role.changed",
  "badge.granted",
]);

export function communityActivityTitle(
  eventType: PlatformEventType,
  payload: Record<string, unknown>,
): string {
  const community = (payload.communityTitle as string) ?? "Community";
  switch (eventType) {
    case "community.event_published":
      return `${community}: Neues Event`;
    case "community.group_created":
      return `${community}: Neue Gruppe`;
    case "community.service_created":
      return `${community}: Neuer Service`;
    case "community.update_published":
      return `${community}: Wichtige Ankündigung`;
    case "community.premium_scheduled":
      return `${community}: Wird kostenpflichtig`;
    case "role.changed":
      return `${community}: Rolle geändert`;
    case "badge.granted":
      return `${community}: Badge erhalten`;
    default:
      return `${community}: Update`;
  }
}

export function communityActivityBody(
  eventType: PlatformEventType,
  payload: Record<string, unknown>,
): string | undefined {
  if (eventType === "community.event_published") {
    return (payload.eventTitle as string) ?? undefined;
  }
  if (eventType === "community.group_created") {
    return (payload.groupTitle as string) ?? undefined;
  }
  if (eventType === "community.premium_scheduled") {
    return (payload.effectiveDate as string) ?? undefined;
  }
  return undefined;
}
