/** Auszeichnungs-Kategorien (UNZE-003) \u2014 erweiterbar ohne Schema-Umbau. */
export type CredentialCategory =
  | "certificate"
  | "community_award"
  | "group_award"
  | "event_award"
  | "course_award"
  | "service_award"
  | "product_award"
  | "verification"
  | "achievement"
  | "legacy";

export interface CredentialDefinitionView {
  id: string;
  communityId: string;
  name: string;
  description: string | null;
  category: CredentialCategory;
  iconUrl: string | null;
}
