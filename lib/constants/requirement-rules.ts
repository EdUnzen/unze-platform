import type {
  RequirementPredicateType,
  RequirementResourceType,
  RequirementSeverity,
} from "@/types/requirement-engine";

export const REQUIREMENT_SEVERITY_OPTIONS: {
  value: RequirementSeverity;
  label: string;
}[] = [
  { value: "none", label: "Keine Pr\u00fcfung" },
  { value: "recommended", label: "Empfohlen (Hinweis)" },
  { value: "required", label: "Pflicht (Zugang blockiert)" },
];

export const REQUIREMENT_RESOURCE_OPTIONS: {
  value: RequirementResourceType;
  label: string;
}[] = [
  { value: "community", label: "Community" },
  { value: "group", label: "Gruppe" },
  { value: "event", label: "Event" },
];

export const REQUIREMENT_PREDICATE_OPTIONS: {
  value: RequirementPredicateType;
  label: string;
  needsRef: "credential" | "event" | "collection" | "role" | "none";
}[] = [
  { value: "credential", label: "Auszeichnung vorhanden", needsRef: "credential" },
  { value: "collection", label: "Sammlung erf\u00fcllt", needsRef: "collection" },
  { value: "membership", label: "Community-Mitglied", needsRef: "none" },
  { value: "premium", label: "Premium aktiv", needsRef: "none" },
  { value: "verification", label: "Profil verifiziert", needsRef: "none" },
  { value: "role", label: "Mindest-Rolle", needsRef: "role" },
  { value: "ticket", label: "Event-Ticket", needsRef: "event" },
];

export const REQUIREMENT_ROLE_OPTIONS = [
  { value: "member", label: "Mitglied" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
  { value: "creator", label: "Creator" },
] as const;

export const REQUIREMENT_OPERATOR_OPTIONS = [
  { value: "AND", label: "Alle (UND)" },
  { value: "OR", label: "Mindestens eine (ODER)" },
] as const;
