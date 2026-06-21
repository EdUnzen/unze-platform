import type { RequirementRuleInput } from "@/types/requirement-dashboard";
import {
  REQUIREMENT_PREDICATE_OPTIONS,
  REQUIREMENT_ROLE_OPTIONS,
} from "@/lib/constants/requirement-rules";

type RefMaps = {
  credentials?: Map<string, string>;
  collections?: Map<string, string>;
  events?: Map<string, string>;
};

export function formatRequirementRuleLabel(
  rule: RequirementRuleInput,
  refs: RefMaps = {},
): string {
  const meta = REQUIREMENT_PREDICATE_OPTIONS.find((p) => p.value === rule.predicateType);
  const base = meta?.label ?? rule.predicateType;

  if (rule.predicateType === "credential" && rule.predicateRefId) {
    const name = refs.credentials?.get(rule.predicateRefId);
    return name ? `${base}: ${name}` : base;
  }

  if (rule.predicateType === "collection" && rule.predicateRefId) {
    const name = refs.collections?.get(rule.predicateRefId);
    return name ? `${base}: ${name}` : base;
  }

  if (rule.predicateType === "ticket") {
    if (rule.predicateRefId) {
      const name = refs.events?.get(rule.predicateRefId);
      return name ? `${base}: ${name}` : base;
    }
    return `${base} (Event der Ressource)`;
  }

  if (rule.predicateType === "role") {
    const role = REQUIREMENT_ROLE_OPTIONS.find((r) => r.value === rule.predicateValue);
    return role ? `${base}: ${role.label}` : base;
  }

  return base;
}

export function buildRefMaps(input: {
  credentials?: { id: string; label: string }[];
  collections?: { id: string; label: string }[];
  events?: { id: string; label: string }[];
}): RefMaps {
  return {
    credentials: new Map((input.credentials ?? []).map((c) => [c.id, c.label])),
    collections: new Map((input.collections ?? []).map((c) => [c.id, c.label])),
    events: new Map((input.events ?? []).map((e) => [e.id, e.label])),
  };
}

export function formatRulesSummary(input: {
  severity: string;
  rootOperator: "AND" | "OR";
  rules: RequirementRuleInput[];
  refs?: RefMaps;
}): string[] {
  if (input.severity === "none" || input.rules.length === 0) {
    return ["Keine aktiven Regeln"];
  }

  const severityLabel =
    input.severity === "required"
      ? "Pflicht"
      : input.severity === "recommended"
        ? "Empfohlen"
        : input.severity;

  const combo =
    input.rules.length > 1
      ? input.rootOperator === "OR"
        ? "Mindestens eine Regel (ODER)"
        : "Alle Regeln (UND)"
      : "Eine Regel";

  const labels = input.rules.map((r) => formatRequirementRuleLabel(r, input.refs));

  return [`${severityLabel} \u00b7 ${combo}`, ...labels.map((l) => `\u2022 ${l}`)];
}
