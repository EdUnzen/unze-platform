import { checkRequirements } from "@/services/requirements/requirement-engine.service";
import { RequirementMemberStatus } from "@/components/requirements/RequirementMemberStatus";

interface CommunityRequirementsHintProps {
  userId: string;
  communityId: string;
}

export async function CommunityRequirementsHint({
  userId,
  communityId,
}: CommunityRequirementsHintProps) {
  const { data } = await checkRequirements(userId, "community", communityId);
  if (!data || data.severity === "none") return null;

  const hasSatisfied = (data.satisfied?.length ?? 0) > 0;
  const hasMissing = (data.missing?.length ?? 0) > 0;

  if (data.fulfilled && !hasSatisfied && !hasMissing) return null;
  if (data.fulfilled && data.severity === "required" && !hasMissing) return null;

  if (!hasSatisfied && !hasMissing) return null;

  return <RequirementMemberStatus evaluation={data} title={data.fulfilled ? undefined : "Für den Beitritt fehlt dir noch:"} />;
}
