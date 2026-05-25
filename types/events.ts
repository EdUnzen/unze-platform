import type { AuditCategory } from "@/types/governance";
import type { NotificationCategory } from "@/types/governance";

/** Plattformweite Event-Typen — dot-notation, stabil für Automationen */
export type PlatformEventType =
  | "community.created"
  | "community.archived"
  | "community.paused"
  | "membership.application_submitted"
  | "membership.application_received"
  | "membership.application_accepted"
  | "membership.application_rejected"
  | "membership.application_waitlisted"
  | "membership.joined"
  | "membership.left"
  | "verification.submitted"
  | "verification.approved"
  | "verification.rejected"
  | "report.created"
  | "moderation.member_banned"
  | "moderation.member_warned"
  | "moderation.member_muted"
  | "moderation.strike_issued"
  | "role.changed"
  | "invite.redeemed"
  | "billing.payment_succeeded"
  | "billing.payment_failed"
  | "badge.granted"
  | "trust.score_changed";

export type PlatformEventDomain =
  | "community"
  | "membership"
  | "verification"
  | "moderation"
  | "trust"
  | "billing"
  | "badge"
  | "governance"
  | "invite"
  | "notification";

export interface PlatformEventRecord {
  id: string;
  eventType: PlatformEventType;
  domain: PlatformEventDomain;
  actorId: string | null;
  subjectType: string | null;
  subjectId: string | null;
  communityId: string | null;
  targetUserId: string | null;
  payload: Record<string, unknown>;
  correlationId: string | null;
  createdAt: string;
}

export interface PublishPlatformEventInput {
  eventType: PlatformEventType;
  actorId?: string | null;
  subjectType?: string | null;
  subjectId?: string | null;
  communityId?: string | null;
  targetUserId?: string | null;
  payload?: Record<string, unknown>;
  correlationId?: string | null;
  idempotencyKey?: string | null;
  /** Zusätzliche Empfänger für Notifications (z.B. Reviewer) */
  notifyUserIds?: string[];
  notificationBodyOverride?: string;
  skipHandlers?: string[];
}

export interface EventDefinition {
  eventType: PlatformEventType;
  domain: PlatformEventDomain;
  label: string;
  notification?: {
    category: NotificationCategory;
    title: string;
    body?: string;
    /** true = an targetUserId, false = an actorId */
    notifyTarget?: boolean;
  };
  audit?: {
    category: AuditCategory;
    actionTemplate: string;
  };
  /** Für Discover/Analytics vorbereitet */
  discoverRelevant?: boolean;
  realtimeChannel?: string;
}

export interface ActivityFeedItem {
  id: string;
  eventType: PlatformEventType;
  domain: PlatformEventDomain;
  label: string;
  actorId: string | null;
  communityId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}
