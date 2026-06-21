import type { RequirementRuleInput } from "@/types/requirement-dashboard";
import type { RequirementSeverity } from "@/types/requirement-engine";
import {
  buildRefMaps,
  formatRulesSummary,
} from "@/lib/requirements/rule-labels";

interface RequirementCreatorPreviewProps {
  title?: string;
  severity: RequirementSeverity;
  rootOperator: "AND" | "OR";
  rules: RequirementRuleInput[];
  credentials: { id: string; label: string }[];
  collections: { id: string; label: string }[];
  events: { id: string; label: string }[];
}

export function RequirementCreatorPreview({
  title = "Aktive Regeln (Vorschau)",
  severity,
  rootOperator,
  rules,
  credentials,
  collections,
  events,
}: RequirementCreatorPreviewProps) {
  const refs = buildRefMaps({ credentials, collections, events });
  const lines = formatRulesSummary({ severity, rootOperator, rules, refs });

  return (
    <div className="rounded-xl border border-unze-green/25 bg-unze-green-muted/20 p-3">
      <p className="text-xs font-semibold text-unze-ink">{title}</p>
      <ul className="mt-2 space-y-1 text-[11px] text-unze-ink-secondary">
        {lines.map((line, index) => (
          <li key={index} className={index === 0 ? "font-medium text-unze-ink" : ""}>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
