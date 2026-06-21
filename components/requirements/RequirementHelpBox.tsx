import {
  REQUIREMENT_OPERATOR_OPTIONS,
  REQUIREMENT_SEVERITY_OPTIONS,
} from "@/lib/constants/requirement-rules";
import { Info } from "lucide-react";

export function RequirementHelpBox() {
  const severityHelp = REQUIREMENT_SEVERITY_OPTIONS.filter((o) => o.value !== "none");
  const operatorHelp = REQUIREMENT_OPERATOR_OPTIONS;

  return (
    <details className="rounded-xl border border-unze-border/70 bg-unze-surface-muted/30 p-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-unze-ink">
        <Info className="h-4 w-4 text-unze-green" aria-hidden />
        {"Kurz erkl\u00e4rt: Pflicht, Empfohlen, UND, ODER"}
      </summary>
      <div className="mt-3 space-y-3 text-[11px] leading-relaxed text-unze-ink-secondary">
        <div>
          <p className="font-semibold text-unze-ink">Schweregrad</p>
          <ul className="mt-1 space-y-1">
            {severityHelp.map((item) => (
              <li key={item.value}>
                <span className="font-medium text-unze-ink">{item.label.split(" (")[0]}</span>
                {" \u2014 "}
                {item.value === "required"
                  ? "Ohne Erf\u00fcllung kein Zugang (Join, Scanner, Buchung)."
                  : "Nutzer sehen einen Hinweis, Zugang bleibt m\u00f6glich."}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-unze-ink">Kombination</p>
          <ul className="mt-1 space-y-1">
            {operatorHelp.map((item) => (
              <li key={item.value}>
                <span className="font-medium text-unze-ink">{item.label}</span>
                {" \u2014 "}
                {item.value === "AND"
                  ? "Jede Regel muss erf\u00fcllt sein."
                  : "Eine erf\u00fcllte Regel reicht aus."}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-unze-ink-muted">
          {"Mitglieder sehen automatisch, was bereits erf\u00fcllt ist und was noch fehlt."}
        </p>
      </div>
    </details>
  );
}
