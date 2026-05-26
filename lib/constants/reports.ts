/** Meldegründe — synchron mit ReportDialog */
export const REPORT_REASONS = [
  "Spam",
  "Belästigung",
  "Betrug / Scam",
  "Externer Scam-Link",
  "Urheberrecht / Rechteverletzung",
  "Unangemessene Inhalte",
  "Impersonation",
  "Sonstiges",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const EXTERNAL_CONTENT_POLICY =
  "UNZE hostet keine fremden Videos oder Bilder neu. Externe Inhalte werden verlinkt, eingebettet oder als Vorschau angezeigt — die Originalplattform bleibt Quelle und Verantwortungsbereich der Community.";
