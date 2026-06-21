import type {
  CommunityAccessStatus,
  JoinApprovalMode,
  JoinApplicationStatus,
  JoinQuestionType,
  PlatformIdentityType,
} from "@/types/access";

export const ACCESS_STATUS_OPTIONS: {
  value: CommunityAccessStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "open",
    label: "Offen",
    description: "Beitritt gemäß konfigurierter Join-Logik möglich.",
  },
  {
    value: "closed",
    label: "Geschlossen",
    description: "Keine neuen Beitritte — Community aktuell geschlossen.",
  },
  {
    value: "paused",
    label: "Aufnahme pausiert",
    description: "Weitere Bewerbungen aktuell pausiert.",
  },
  {
    value: "invite_only",
    label: "Nur Einladung",
    description: "Beitritt nur über Einladung oder manuelle Freigabe.",
  },
  {
    value: "member_limit_reached",
    label: "Mitgliederlimit erreicht",
    description: "Automatisch gesetzt wenn das Limit erreicht ist.",
  },
  {
    value: "archived",
    label: "Archiviert",
    description: "Community archiviert — keine Beitritte, aus Discover ausgeblendet.",
  },
];

export const JOIN_APPROVAL_OPTIONS: {
  value: JoinApprovalMode;
  label: string;
  description: string;
}[] = [
  {
    value: "auto_accept",
    label: "Automatische Annahme",
    description: "Anträge werden sofort angenommen (wenn keine Blocker).",
  },
  {
    value: "manual_review",
    label: "Manuelle Prüfung",
    description: "Creator/Admin/Moderator entscheidet über Anträge.",
  },
  {
    value: "auto_reject",
    label: "Automatische Ablehnung",
    description: "Neue Anträge werden abgelehnt.",
  },
  {
    value: "waitlist",
    label: "Warteliste",
    description: "Anträge landen auf der Warteliste zur späteren Prüfung.",
  },
  {
    value: "invite_required",
    label: "Einladung erforderlich",
    description: "Beitritt nur mit gültigem Einladungslink.",
  },
  {
    value: "paid_unlock",
    label: "Kostenpflichtige Freischaltung",
    description: "Stripe-Abo erforderlich (vorbereitet).",
  },
];

export const JOIN_QUESTION_TYPE_OPTIONS: {
  value: JoinQuestionType;
  label: string;
}[] = [
  { value: "text", label: "Freitext" },
  { value: "checkbox", label: "Checkbox / Ja-Nein" },
  { value: "rules_consent", label: "Regeln / AGB Zustimmung" },
  { value: "age_verification", label: "Altersprüfung (Datum)" },
  { value: "age_proof", label: "Altersnachweis (Upload)" },
  { value: "identity_proof", label: "Identitätsnachweis (Creator-Vorbereitung)" },
  { value: "file_upload", label: "Dokument-Nachweis" },
  { value: "image_upload", label: "Bild-Nachweis" },
];

export const PLATFORM_IDENTITY_OPTIONS: {
  value: PlatformIdentityType;
  label: string;
  placeholder: string;
}[] = [
  { value: "discord", label: "Discord", placeholder: "username#1234 oder ID" },
  { value: "whatsapp", label: "WhatsApp", placeholder: "+49..." },
  { value: "telegram", label: "Telegram", placeholder: "@username" },
  { value: "psn", label: "PlayStation (PSN)", placeholder: "PSN-ID" },
  { value: "epic", label: "Epic Games", placeholder: "Epic-Username" },
  { value: "phone", label: "Telefonnummer", placeholder: "+49..." },
  { value: "linkedin", label: "LinkedIn", placeholder: "Profil-URL oder Name" },
  { value: "instagram", label: "Instagram", placeholder: "@username" },
  { value: "x", label: "X (Twitter)", placeholder: "@username" },
  { value: "tiktok", label: "TikTok", placeholder: "@username" },
  { value: "facebook", label: "Facebook", placeholder: "Profil-Name oder URL" },
  { value: "other", label: "Andere", placeholder: "Plattform-ID" },
];

export type PlatformIdentityGroupId =
  | "communication"
  | "gaming"
  | "social"
  | "other";

/** UX-Gruppen fuer Pflicht-Plattform-IDs (Creator-Dashboard). */
export const PLATFORM_IDENTITY_GROUPS: {
  id: PlatformIdentityGroupId;
  label: string;
  values: PlatformIdentityType[];
}[] = [
  {
    id: "communication",
    label: "Kommunikation",
    values: ["whatsapp", "discord", "telegram"],
  },
  {
    id: "gaming",
    label: "Gaming",
    values: ["psn", "epic"],
  },
  {
    id: "social",
    label: "Social",
    values: ["instagram", "tiktok", "linkedin", "x", "facebook"],
  },
  {
    id: "other",
    label: "Weitere",
    values: ["phone", "other"],
  },
];

export function getPlatformIdentityOption(value: PlatformIdentityType) {
  return PLATFORM_IDENTITY_OPTIONS.find((p) => p.value === value);
}

export const APPLICATION_STATUS_LABELS: Record<JoinApplicationStatus, string> = {
  pending: "Offen",
  accepted: "Angenommen",
  rejected: "Abgelehnt",
  waitlisted: "Warteliste",
  withdrawn: "Zurückgezogen",
};

export const APPLICATION_SOURCE_LABELS: Record<
  import("@/types/access").JoinApplicationSource,
  string
> = {
  application: "Bewerbung",
  invite: "Einladung",
  direct: "Direkt",
};

export const SYSTEM_MESSAGE_TEMPLATES = {
  community_closed: "Community aktuell geschlossen",
  member_limit_reached: "Mitgliederlimit erreicht",
  application_rejected: "Antrag abgelehnt",
  application_accepted: "Antrag angenommen",
  admissions_paused: "Weitere Bewerbungen aktuell pausiert",
  auto_rejected: "Beitritt derzeit nicht möglich",
  waitlisted: "Du stehst auf der Warteliste",
  invite_required: "Nur mit gültigem Einladungslink",
  invite_redeemed: "Einladung angenommen",
  invite_expired: "Einladungslink abgelaufen",
} as const;
