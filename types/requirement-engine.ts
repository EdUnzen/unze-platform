export type RequirementSeverity = "none" | "recommended" | "required";

export type RequirementResourceType =
  | "community"
  | "group"
  | "event"
  | "service"
  | "course"
  | "product"
  | "tournament"
  | "premium_content";

export type RequirementPredicateType =
  | "credential"
  | "membership"
  | "premium"
  | "verification"
  | "role"
  | "ticket"
  | "collection";

export interface RequirementMissingItem {
  predicate: string;
  label: string;
}

export interface RequirementEvaluation {
  fulfilled: boolean;
  severity: RequirementSeverity;
  missing: RequirementMissingItem[];
  satisfied?: RequirementMissingItem[];
  phase?: number;
  note?: string;
}

export type UnzeVerifyResultCode =
  | "allowed"
  | "denied"
  | "identity_not_found"
  | "scanner_not_authorized";

export interface UnzeVerifyResult {
  allowed: boolean;
  resultCode: UnzeVerifyResultCode;
  severity?: RequirementSeverity;
}
