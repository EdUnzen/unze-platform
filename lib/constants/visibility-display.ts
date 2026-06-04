import { VISIBILITY_OPTIONS } from "@/lib/constants/community";
import type { CommunityVisibility } from "@/types/community";

export function getVisibilityDisplayLabel(
  visibility: CommunityVisibility,
): string {
  return (
    VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.label ??
    (visibility === "hidden" ? "Intern" : visibility)
  );
}
