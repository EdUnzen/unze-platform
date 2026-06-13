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
} as const;
