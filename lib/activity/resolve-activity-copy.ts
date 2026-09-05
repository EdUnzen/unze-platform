import { ROLE_LABELS } from "@/lib/constants/dashboard";
import type { ActivityFeedItem, PlatformEventType } from "@/types/events";

export type ResolvedActivityCopy = {
  title: string;
  subtitle?: string;
  communityTitle?: string;
  communitySlug?: string;
};

function communityLabel(item: ActivityFeedItem): string {
  return (
    (item.payload.communityTitle as string) ??
    (item.communityTitle as string | undefined) ??
    "Community"
  );
}

function slug(item: ActivityFeedItem): string | undefined {
  return (
    (item.payload.communitySlug as string | undefined) ??
    item.communitySlug ??
    undefined
  );
}

/** Nutzer-sichtbare Beschreibung — persönliche vs. Admin-Perspektive */
export function resolveActivityCopy(
  item: ActivityFeedItem,
  viewerUserId?: string | null,
): ResolvedActivityCopy {
  const community = communityLabel(item);
  const communitySlug = slug(item);
  const isTarget = Boolean(viewerUserId && item.targetUserId === viewerUserId);
  const isActor = Boolean(viewerUserId && item.actorId === viewerUserId);

  switch (item.eventType) {
    case "badge.granted": {
      const badge = (item.payload.badgeName as string) ?? "Auszeichnung";
      if (isTarget) {
        return {
          title: `Du hast „${badge}" erhalten`,
          subtitle: community,
          communityTitle: community,
          communitySlug,
        };
      }
      const recipient = (item.payload.recipientName as string) ?? "Mitglied";
      return {
        title: `${recipient} hat „${badge}" erhalten`,
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    }
    case "role.changed": {
      const roleTitle = item.payload.roleTitle as string | undefined;
      const toRole = (item.payload.toRole as string) ?? "member";
      const roleLabel = roleTitle?.trim() || ROLE_LABELS[toRole] || toRole;
      if (isTarget) {
        return {
          title: `Neue Rolle: ${roleLabel}`,
          subtitle: community,
          communityTitle: community,
          communitySlug,
        };
      }
      return {
        title: `Rolle geändert → ${roleLabel}`,
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    }
    case "membership.application_submitted":
      return {
        title: isTarget ? "Beitrittsantrag gesendet" : "Neuer Beitrittsantrag",
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    case "membership.application_accepted":
      return {
        title: isTarget ? "Beitritt bestätigt — willkommen!" : "Beitrittsantrag angenommen",
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    case "membership.application_rejected":
      return {
        title: isTarget ? "Beitrittsantrag abgelehnt" : "Beitrittsantrag abgelehnt",
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    case "membership.application_waitlisted":
      return {
        title: isTarget ? "Du stehst auf der Warteliste" : "Antrag auf Warteliste",
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    case "membership.joined":
      return {
        title: isActor || isTarget ? "Community beigetreten" : item.label,
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    case "membership.left":
      return {
        title: isActor || isTarget ? "Community verlassen" : item.label,
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    case "community.created":
      return {
        title: isActor ? "Community erstellt" : item.label,
        subtitle: (item.payload.title as string) ?? community,
        communityTitle: community,
        communitySlug,
      };
    case "community.event_published":
      return {
        title: isActor ? "Event veröffentlicht" : `Neues Event in ${community}`,
        subtitle: (item.payload.eventTitle as string) ?? undefined,
        communityTitle: community,
        communitySlug,
      };
    case "community.group_created":
      return {
        title: isActor ? "Gruppe erstellt" : `Neue Gruppe in ${community}`,
        subtitle: (item.payload.groupTitle as string) ?? undefined,
        communityTitle: community,
        communitySlug,
      };
    case "community.service_created":
      return {
        title: isActor ? "Service erstellt" : `Neuer Service in ${community}`,
        subtitle: (item.payload.groupTitle as string) ?? undefined,
        communityTitle: community,
        communitySlug,
      };
    case "verification.approved":
      return {
        title: isTarget ? "Verifizierung bestätigt" : "Verifizierung genehmigt",
        subtitle: community !== "Community" ? community : undefined,
        communityTitle: community,
        communitySlug,
      };
    case "verification.rejected":
      return {
        title: isTarget ? "Verifizierung abgelehnt" : item.label,
        subtitle: undefined,
        communityTitle: community,
        communitySlug,
      };
    case "billing.payment_succeeded":
      return {
        title: "Zahlung erfolgreich",
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    case "billing.payment_failed":
      return {
        title: "Zahlung fehlgeschlagen",
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    case "invite.redeemed":
      return {
        title: isTarget ? "Einladung angenommen" : item.label,
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    case "moderation.strike_issued":
    case "moderation.member_banned":
    case "moderation.member_warned":
    case "moderation.member_muted":
      return {
        title: isTarget ? item.label : item.label,
        subtitle: community,
        communityTitle: community,
        communitySlug,
      };
    default:
      return {
        title: item.label,
        subtitle: community !== "Community" ? community : undefined,
        communityTitle: community,
        communitySlug,
      };
  }
}

const ADMIN_ONLY_ACTOR_EVENTS = new Set<PlatformEventType>([
  "membership.application_received",
  "report.created",
]);

const HIDDEN_FOR_PERSONAL_VIEW = new Set<PlatformEventType>([
  "membership.application_received",
  "report.created",
  "trust.score_changed",
]);

/** Persönliche Timeline — keine fremden Admin-Vorgänge */
export function isPersonalActivityItem(
  item: ActivityFeedItem,
  userId: string,
): boolean {
  if (HIDDEN_FOR_PERSONAL_VIEW.has(item.eventType)) return false;

  if (item.targetUserId === userId) return true;

  if (item.actorId === userId) {
    if (ADMIN_ONLY_ACTOR_EVENTS.has(item.eventType)) return false;
    if (item.eventType === "badge.granted" && item.targetUserId !== userId) {
      return false;
    }
    return true;
  }

  return false;
}
