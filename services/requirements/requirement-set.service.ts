import { fetchGroupsByCommunityId } from "@/services/community/group.repository";
import { getCommunityEventsAdmin } from "@/services/events/event.service";
import {
  deleteRequirementSetInDb,
  fetchRequirementSetForResource,
  saveRequirementSetInDb,
} from "./requirement-set.repository";
import type {
  RequirementResourceOption,
  RequirementRuleInput,
  RequirementSetView,
} from "@/types/requirement-dashboard";
import type {
  RequirementResourceType,
  RequirementSeverity,
} from "@/types/requirement-engine";

export async function getRequirementResources(
  communityId: string,
  communityTitle: string,
): Promise<RequirementResourceOption[]> {
  const [groups, events] = await Promise.all([
    fetchGroupsByCommunityId(communityId),
    getCommunityEventsAdmin(communityId),
  ]);

  const resources: RequirementResourceOption[] = [
    {
      type: "community",
      id: communityId,
      label: `Community: ${communityTitle}`,
    },
  ];

  for (const group of groups) {
    resources.push({
      type: "group",
      id: group.id,
      label: `Gruppe: ${group.title}`,
    });
  }

  for (const event of events) {
    resources.push({
      type: "event",
      id: event.id,
      label: `Event: ${event.title}`,
    });
  }

  return resources;
}

export async function getRequirementSet(
  resourceType: RequirementResourceType,
  resourceId: string,
): Promise<RequirementSetView | null> {
  return fetchRequirementSetForResource(resourceType, resourceId);
}

export async function saveRequirementSet(input: {
  communityId: string;
  resourceType: RequirementResourceType;
  resourceId: string;
  severity: RequirementSeverity;
  label?: string | null;
  rootOperator: "AND" | "OR";
  rules: RequirementRuleInput[];
}) {
  return saveRequirementSetInDb(input);
}

export async function deleteRequirementSet(setId: string) {
  return deleteRequirementSetInDb(setId);
}
