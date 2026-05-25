/**
 * Plattform-Service-Registry — modulare Domänen-Services
 *
 * Jedes Modul bleibt eigenständig; der Event-Bus verbindet sie lose gekoppelt.
 * Spätere Erweiterungen (Realtime, AI, Stripe Webhooks) hängen Handler an.
 */

export type PlatformServiceId =
  | "event-bus"
  | "notifications"
  | "moderation"
  | "trust"
  | "discover"
  | "verification"
  | "membership"
  | "billing"
  | "activity"
  | "audit";

export interface PlatformServiceDescriptor {
  id: PlatformServiceId;
  module: string;
  description: string;
  status: "active" | "prepared" | "planned";
  emits?: string[];
  consumes?: string[];
}

export const PLATFORM_SERVICES: PlatformServiceDescriptor[] = [
  {
    id: "event-bus",
    module: "services/platform/event-bus.service.ts",
    description: "Globaler Event-Store + Handler-Pipeline",
    status: "active",
    emits: ["*"],
  },
  {
    id: "notifications",
    module: "services/notifications/notification-center.service.ts",
    description: "In-App Notifications, Preferences, Moderationshinweise",
    status: "active",
    consumes: ["notification.handler"],
  },
  {
    id: "audit",
    module: "services/governance/audit.service.ts",
    description: "Audit-Logs für Rollen, Moderation, Lifecycle",
    status: "active",
    consumes: ["audit.handler"],
  },
  {
    id: "activity",
    module: "services/platform/activity.service.ts",
    description: "Activity-Feed aus platform_events",
    status: "active",
    consumes: ["platform_events"],
  },
  {
    id: "moderation",
    module: "services/governance/moderation.service.ts",
    description: "Reports, Strikes, Bans, Mutes",
    status: "active",
    emits: [
      "report.created",
      "moderation.member_banned",
      "moderation.strike_issued",
    ],
  },
  {
    id: "trust",
    module: "services/trust/trust.service.ts",
    description: "Trust-Score, Reputation, Flags",
    status: "active",
    emits: ["trust.score_changed"],
  },
  {
    id: "discover",
    module: "services/platform/discover.service.ts",
    description: "Discover-Signale aus Events (Ranking vorbereitet)",
    status: "prepared",
    consumes: ["trust.score_changed", "community.created"],
  },
  {
    id: "verification",
    module: "services/verification/verification.service.ts",
    description: "Creator/Community-Verifizierung",
    status: "active",
    emits: [
      "verification.submitted",
      "verification.approved",
      "verification.rejected",
    ],
  },
  {
    id: "membership",
    module: "services/access/access.service.ts",
    description: "Beitritte, Anträge, Warteliste, Invites",
    status: "active",
    emits: [
      "membership.application_submitted",
      "membership.application_accepted",
      "invite.redeemed",
    ],
  },
  {
    id: "billing",
    module: "services/platform/billing.service.ts",
    description: "Stripe/Billing-Events (Webhook-ready)",
    status: "prepared",
    emits: ["billing.payment_succeeded", "billing.payment_failed"],
  },
];

/** Geplante Realtime-Kanäle — Supabase Realtime */
export const REALTIME_CHANNELS = {
  communityEvents: (communityId: string) => `community:${communityId}:events`,
  userNotifications: (userId: string) => `user:${userId}:notifications`,
  platformAdmin: "platform:admin:events",
} as const;

/** Geplante Automationen / KI-Integration */
export const PLANNED_AUTOMATIONS = [
  "ai_moderation.report_triage",
  "analytics.community_insights",
  "analytics.creator_insights",
  "discover.trust_ranking",
  "billing.stripe_webhook",
] as const;

export function getPlatformService(id: PlatformServiceId) {
  return PLATFORM_SERVICES.find((s) => s.id === id) ?? null;
}
