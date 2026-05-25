import type { EventDefinition, PlatformEventType } from "@/types/events";

export const PLATFORM_EVENT_CATALOG: Record<PlatformEventType, EventDefinition> = {
  "community.created": {
    eventType: "community.created",
    domain: "community",
    label: "Community erstellt",
    audit: { category: "community_lifecycle", actionTemplate: "Community erstellt" },
    discoverRelevant: true,
  },
  "community.archived": {
    eventType: "community.archived",
    domain: "community",
    label: "Community archiviert",
    notification: {
      category: "community_event",
      title: "Community archiviert",
      body: "Diese Community wurde archiviert.",
      notifyTarget: true,
    },
    audit: { category: "community_lifecycle", actionTemplate: "Community archiviert" },
  },
  "community.paused": {
    eventType: "community.paused",
    domain: "community",
    label: "Community pausiert",
    notification: {
      category: "community_event",
      title: "Community pausiert",
      notifyTarget: true,
    },
    audit: { category: "community_lifecycle", actionTemplate: "Community pausiert" },
  },
  "membership.application_submitted": {
    eventType: "membership.application_submitted",
    domain: "membership",
    label: "Beitrittsantrag eingereicht",
    notification: {
      category: "application",
      title: "Antrag eingereicht",
      body: "Dein Beitrittsantrag wird geprüft.",
      notifyTarget: true,
    },
    audit: { category: "application", actionTemplate: "Beitrittsantrag eingereicht" },
  },
  "membership.application_received": {
    eventType: "membership.application_received",
    domain: "membership",
    label: "Neuer Beitrittsantrag",
    notification: {
      category: "application",
      title: "Neuer Beitrittsantrag",
      body: "Ein Nutzer hat einen Beitrittsantrag eingereicht.",
    },
    audit: { category: "application", actionTemplate: "Neuer Beitrittsantrag" },
  },
  "membership.application_accepted": {
    eventType: "membership.application_accepted",
    domain: "membership",
    label: "Antrag angenommen",
    notification: {
      category: "application",
      title: "Antrag angenommen",
      body: "Willkommen in der Community!",
      notifyTarget: true,
    },
    audit: { category: "application", actionTemplate: "Beitrittsantrag angenommen" },
    discoverRelevant: true,
  },
  "membership.application_rejected": {
    eventType: "membership.application_rejected",
    domain: "membership",
    label: "Antrag abgelehnt",
    notification: {
      category: "application",
      title: "Antrag abgelehnt",
      notifyTarget: true,
    },
    audit: { category: "application", actionTemplate: "Beitrittsantrag abgelehnt" },
  },
  "membership.application_waitlisted": {
    eventType: "membership.application_waitlisted",
    domain: "membership",
    label: "Auf Warteliste",
    notification: {
      category: "application",
      title: "Warteliste",
      body: "Du stehst auf der Warteliste.",
      notifyTarget: true,
    },
    audit: { category: "application", actionTemplate: "Antrag auf Warteliste" },
  },
  "membership.joined": {
    eventType: "membership.joined",
    domain: "membership",
    label: "Beigetreten",
    audit: { category: "membership", actionTemplate: "Community beigetreten" },
    discoverRelevant: true,
  },
  "membership.left": {
    eventType: "membership.left",
    domain: "membership",
    label: "Verlassen",
    audit: { category: "membership", actionTemplate: "Community verlassen" },
  },
  "verification.submitted": {
    eventType: "verification.submitted",
    domain: "verification",
    label: "Verifizierung eingereicht",
    notification: {
      category: "system",
      title: "Verifizierung eingereicht",
      body: "Dein Antrag wird geprüft.",
      notifyTarget: true,
    },
    audit: { category: "verification", actionTemplate: "Verifizierung eingereicht" },
  },
  "verification.approved": {
    eventType: "verification.approved",
    domain: "verification",
    label: "Verifizierung freigegeben",
    notification: {
      category: "system",
      title: "Verifizierung freigegeben",
      body: "Glückwunsch — du bist jetzt verifiziert!",
      notifyTarget: true,
    },
    audit: { category: "verification", actionTemplate: "Verifizierung freigegeben" },
    discoverRelevant: true,
  },
  "verification.rejected": {
    eventType: "verification.rejected",
    domain: "verification",
    label: "Verifizierung abgelehnt",
    notification: {
      category: "system",
      title: "Verifizierung abgelehnt",
      notifyTarget: true,
    },
    audit: { category: "verification", actionTemplate: "Verifizierung abgelehnt" },
  },
  "report.created": {
    eventType: "report.created",
    domain: "moderation",
    label: "Meldung erstellt",
    audit: { category: "moderation", actionTemplate: "Meldung eingereicht" },
  },
  "moderation.member_banned": {
    eventType: "moderation.member_banned",
    domain: "moderation",
    label: "Mitglied gebannt",
    notification: {
      category: "moderation",
      title: "Community-Ausschluss",
      body: "Du wurdest aus dieser Community ausgeschlossen.",
      notifyTarget: true,
    },
    audit: { category: "moderation", actionTemplate: "Mitglied gebannt" },
  },
  "moderation.member_warned": {
    eventType: "moderation.member_warned",
    domain: "moderation",
    label: "Verwarnung",
    notification: {
      category: "moderation",
      title: "Verwarnung",
      notifyTarget: true,
    },
    audit: { category: "moderation", actionTemplate: "Verwarnung ausgesprochen" },
  },
  "moderation.member_muted": {
    eventType: "moderation.member_muted",
    domain: "moderation",
    label: "Stummgeschaltet",
    notification: {
      category: "moderation",
      title: "Stummgeschaltet",
      notifyTarget: true,
    },
    audit: { category: "moderation", actionTemplate: "Mitglied stummgeschaltet" },
  },
  "moderation.strike_issued": {
    eventType: "moderation.strike_issued",
    domain: "moderation",
    label: "Strike",
    notification: {
      category: "moderation",
      title: "Strike erhalten",
      notifyTarget: true,
    },
    audit: { category: "moderation", actionTemplate: "Strike ausgesprochen" },
  },
  "role.changed": {
    eventType: "role.changed",
    domain: "governance",
    label: "Rolle geändert",
    notification: {
      category: "community_event",
      title: "Rolle geändert",
      notifyTarget: true,
    },
    audit: { category: "role_change", actionTemplate: "Rolle geändert" },
  },
  "invite.redeemed": {
    eventType: "invite.redeemed",
    domain: "invite",
    label: "Einladung angenommen",
    notification: {
      category: "invite",
      title: "Einladung angenommen",
      body: "Du bist über eine Einladung beigetreten.",
      notifyTarget: true,
    },
    audit: { category: "invite", actionTemplate: "Einladung eingelöst" },
  },
  "billing.payment_succeeded": {
    eventType: "billing.payment_succeeded",
    domain: "billing",
    label: "Zahlung erfolgreich",
    notification: {
      category: "system",
      title: "Zahlung erfolgreich",
      body: "Dein Abo wurde aktiviert.",
      notifyTarget: true,
    },
    audit: { category: "settings", actionTemplate: "Zahlung erfolgreich" },
  },
  "billing.payment_failed": {
    eventType: "billing.payment_failed",
    domain: "billing",
    label: "Zahlung fehlgeschlagen",
    notification: {
      category: "system",
      title: "Zahlung fehlgeschlagen",
      notifyTarget: true,
    },
  },
  "badge.granted": {
    eventType: "badge.granted",
    domain: "badge",
    label: "Badge vergeben",
    notification: {
      category: "community_event",
      title: "Badge erhalten",
      notifyTarget: true,
    },
    audit: { category: "membership", actionTemplate: "Badge vergeben" },
  },
  "trust.score_changed": {
    eventType: "trust.score_changed",
    domain: "trust",
    label: "Trust-Score geändert",
    audit: { category: "settings", actionTemplate: "Trust-Score geändert" },
    discoverRelevant: true,
  },
};

export function getEventDefinition(
  eventType: PlatformEventType,
): EventDefinition {
  return PLATFORM_EVENT_CATALOG[eventType];
}
