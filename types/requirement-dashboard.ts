import type {
  RequirementPredicateType,
  RequirementResourceType,
  RequirementSeverity,
} from "@/types/requirement-engine";

export interface RequirementResourceOption {
  type: RequirementResourceType;
  id: string;
  label: string;
}

export interface RequirementRuleView {
  id: string;
  predicateType: RequirementPredicateType;
  predicateRefId: string | null;
  predicateValue: string | null;
  sortOrder: number;
}

export interface RequirementSetView {
  id: string;
  communityId: string;
  resourceType: RequirementResourceType;
  resourceId: string;
  severity: RequirementSeverity;
  label: string | null;
  isActive: boolean;
  rootOperator: "AND" | "OR";
  rules: RequirementRuleView[];
}

export interface RequirementRuleInput {
  predicateType: RequirementPredicateType;
  predicateRefId?: string | null;
  predicateValue?: string | null;
}

export interface CredentialCollectionView {
  id: string;
  communityId: string;
  name: string;
  description: string | null;
  credentialIds: string[];
}
