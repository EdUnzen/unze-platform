/** Einheitliche Nutzer-Rückmeldungen für Aktionen (Closed Beta UX) */

export const ACTION_MESSAGES = {
  community: {
    joined: "Community erfolgreich beigetreten",
    alreadyMember: "Mitgliedschaft bereits aktiv.",
    left: "Community erfolgreich verlassen",
    applicationSent: "Anfrage erfolgreich gesendet",
    applicationWithdrawn: "Anfrage zurückgezogen",
    applicationApproved: "Anfrage genehmigt",
    applicationRejected: "Anfrage abgelehnt",
    followed: "Community wird gefolgt",
    unfollowed: "Community entfolgt",
  },
  group: {
    joined: "Gruppe erfolgreich beigetreten",
    left: "Gruppe erfolgreich verlassen",
    created: "Gruppe erfolgreich erstellt",
    updated: "Änderungen gespeichert",
    deactivated: "Gruppe deaktiviert — nicht mehr öffentlich sichtbar",
    activated: "Gruppe wieder aktiviert",
    deleted: "Gruppe gelöscht",
  },
  event: {
    ticketBooked: "Ticket erfolgreich gebucht",
    ticketCancelled: "Ticket erfolgreich storniert",
    ticketCancelFailed: "Ticket konnte nicht storniert werden",
    eventAlreadyStarted: "Event bereits gestartet — Stornierung nicht mehr möglich",
    ticketNotFound: "Ticket nicht gefunden",
    checkedIn: "Ticket erfolgreich eingecheckt",
  },
  service: {
    booked: "Service erfolgreich gebucht",
    bookingFailed: "Buchung fehlgeschlagen",
  },
  membership: {
    activated: "Mitgliedschaft aktiviert",
    cancelled: "Mitgliedschaft gekündigt",
    paymentSuccess: "Zahlung erfolgreich",
    paymentFailed: "Zahlung fehlgeschlagen",
  },
  awards: {
    created: "Auszeichnung erstellt",
    updated: "Auszeichnung gespeichert",
    archived: "Auszeichnung archiviert",
    granted: "Auszeichnung vergeben",
  },
  roles: {
    updated: "Rolle gespeichert",
    titleUpdated: "Anzeigetitel gespeichert",
  },
} as const;
