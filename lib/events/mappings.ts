import type { LifecycleNotificationEvent } from "@/lib/access/lifecycle-notifications";
import type { GovernanceNotificationEvent } from "@/lib/notifications/events";
import type { VerificationNotificationEvent } from "@/lib/notifications/verification-events";
import type { PlatformEventType } from "@/types/events";

export const LIFECYCLE_EVENT_MAP: Record<
  LifecycleNotificationEvent,
  PlatformEventType
> = {
  application_received: "membership.application_received",
  application_submitted: "membership.application_submitted",
  application_accepted: "membership.application_accepted",
  application_rejected: "membership.application_rejected",
  application_waitlisted: "membership.application_waitlisted",
  invite_accepted: "invite.redeemed",
  member_banned: "moderation.member_banned",
  community_archived: "community.archived",
};

export const GOVERNANCE_EVENT_MAP: Partial<
  Record<GovernanceNotificationEvent, PlatformEventType>
> = {
  strike_received: "moderation.strike_issued",
  member_muted: "moderation.member_muted",
  member_warned: "moderation.member_warned",
  member_banned: "moderation.member_banned",
  community_archived: "community.archived",
  community_paused: "community.paused",
  role_changed: "role.changed",
};

export const VERIFICATION_EVENT_MAP: Partial<
  Record<VerificationNotificationEvent, PlatformEventType>
> = {
  verification_submitted: "verification.submitted",
  verification_approved: "verification.approved",
  verification_rejected: "verification.rejected",
};

export function mapLifecycleToPlatform(
  event: LifecycleNotificationEvent,
): PlatformEventType {
  return LIFECYCLE_EVENT_MAP[event];
}

export function mapGovernanceToPlatform(
  event: GovernanceNotificationEvent,
): PlatformEventType | null {
  return GOVERNANCE_EVENT_MAP[event] ?? null;
}

export function mapVerificationToPlatform(
  event: VerificationNotificationEvent,
): PlatformEventType | null {
  return VERIFICATION_EVENT_MAP[event] ?? null;
}
