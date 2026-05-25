import type {
  VerificationDocumentType,
  VerificationStatus,
  VerificationType,
} from "@/types/verification";

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  draft: "Entwurf",
  pending: "Eingereicht",
  reviewing: "In Prüfung",
  approved: "Freigegeben",
  rejected: "Abgelehnt",
  expired: "Abgelaufen",
  revoked: "Widerrufen",
};

export const VERIFICATION_TYPE_LABELS: Record<VerificationType, string> = {
  creator_identity: "Creator — Identität",
  creator_business: "Creator — Gewerbe/Unternehmen",
  community: "Community-Verifizierung",
  platform: "Plattform-Verifizierung",
};

export const VERIFICATION_DOCUMENT_LABELS: Record<VerificationDocumentType, string> = {
  identity_document: "Ausweis / ID",
  selfie: "Selfie mit Ausweis",
  business_registration: "Gewerbeanmeldung / Handelsregister",
  tax_certificate: "Steuerbescheinigung",
  platform_reference: "Plattform-Referenz",
  community_ownership: "Community-Nachweis",
  other: "Sonstiges",
};

export const CREATOR_VERIFICATION_TYPES = [
  "creator_identity",
  "creator_business",
] as const;

export const REQUIRED_CREATOR_DOCS: Record<
  "creator_identity" | "creator_business",
  VerificationDocumentType[]
> = {
  creator_identity: ["identity_document"],
  creator_business: ["identity_document", "business_registration"],
};

export const COMMUNITY_REQUIRED_DOCS: VerificationDocumentType[] = [
  "community_ownership",
];
