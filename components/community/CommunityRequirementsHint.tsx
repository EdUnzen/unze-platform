import { checkRequirements } from "@/services/requirements/requirement-engine.service";
import type { RequirementEvaluation } from "@/types/requirement-engine";

interface CommunityRequirementsHintProps {
  userId: string;
  communityId: string;
}

export async function CommunityRequirementsHint({
  userId,
  communityId,
}: CommunityRequirementsHintProps) {
  const { data } = await checkRequirements(userId, "community", communityId);
  if (!data || data.severity === "none" || data.fulfilled) return null;

  return (
    <RequirementsHintBox evaluation={data} />
  );
}

function RequirementsHintBox({ evaluation }: { evaluation: RequirementEvaluation }) {
  const isRequired = evaluation.severity === "required";

  return (
    <div
      className={
        isRequired
          ? "rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-3"
          : "rounded-2xl border border-sky-200/80 bg-sky-50 px-4 py-3"
      }
    >
      <p className="text-sm font-medium text-unze-ink">
        {isRequired ? "Zugangsvoraussetzungen fehlen" : "Empfohlene Voraussetzungen"}
      </p>
      {evaluation.missing.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-unze-ink-secondary">
          {evaluation.missing.map((item, index) => (
            <li key={`${item.predicate}-${index}`}>
              {"\u2022"} {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
