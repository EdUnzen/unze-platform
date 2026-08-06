import type { RequirementEvaluation } from "@/types/requirement-engine";

interface RequirementMemberStatusProps {
  evaluation: RequirementEvaluation;
  title?: string;
}

export function RequirementMemberStatus({
  evaluation,
  title,
}: RequirementMemberStatusProps) {
  const isRequired = evaluation.severity === "required";
  const satisfied = evaluation.satisfied ?? [];
  const missing = evaluation.missing ?? [];

  if (evaluation.severity === "none") return null;

  if (evaluation.fulfilled && satisfied.length === 0 && missing.length === 0) {
    return null;
  }

  const heading =
    title ??
    (evaluation.fulfilled
      ? isRequired
        ? "Alle Pflicht-Voraussetzungen erfüllt"
        : "Empfohlene Voraussetzungen erfüllt"
      : isRequired
        ? "Noch nicht alle Pflicht-Voraussetzungen erfüllt"
        : "Empfohlene Voraussetzungen");

  return (
    <div
      className={
        evaluation.fulfilled
          ? "rounded-2xl border border-unze-green/30 bg-unze-green-muted/25 px-4 py-3"
          : isRequired
            ? "rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-3"
            : "rounded-2xl border border-sky-200/80 bg-sky-50 px-4 py-3"
      }
    >
      <p className="text-sm font-medium text-unze-ink">{heading}</p>

      {satisfied.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-unze-green-dark">
            {"🟢"} Bereits erf{"ü"}llt
          </p>
          <ul className="mt-1 space-y-1 text-xs text-unze-ink-secondary">
            {satisfied.map((item, index) => (
              <li key={`ok-${item.predicate}-${index}`}>
                {"•"} {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {missing.length > 0 && (
        <div className={satisfied.length > 0 ? "mt-3" : "mt-2"}>
          <p className="text-xs font-semibold text-red-700">
            {"🔴"}{" "}
            {isRequired ? "Noch erforderlich" : "Noch empfohlen"}
          </p>
          <ul className="mt-1 space-y-1 text-xs text-unze-ink-secondary">
            {missing.map((item, index) => (
              <li key={`miss-${item.predicate}-${index}`}>
                {"•"} {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
