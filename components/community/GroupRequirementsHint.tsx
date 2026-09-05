import { RequirementMemberStatus } from "@/components/requirements/RequirementMemberStatus";
import { checkRequirements } from "@/services/requirements/requirement-engine.service";

interface GroupRequirementsHintProps {
  userId: string;
  groupId: string;
}

export async function GroupRequirementsHint({
  userId,
  groupId,
}: GroupRequirementsHintProps) {
  const { data } = await checkRequirements(userId, "group", groupId);
  if (!data || data.severity === "none") return null;

  const hasSatisfied = (data.satisfied?.length ?? 0) > 0;
  const hasMissing = (data.missing?.length ?? 0) > 0;

  if (data.fulfilled && !hasSatisfied && !hasMissing) return null;
  if (data.fulfilled && data.severity === "required" && !hasMissing) return null;
  if (!hasSatisfied && !hasMissing) return null;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <RequirementMemberStatus
        evaluation={data}
        title={
          data.fulfilled
            ? undefined
            : data.severity === "required"
              ? "Für Zutritt fehlt dir noch:"
              : "Empfohlen vor dem Beitritt:"
        }
      />
    </section>
  );
}
