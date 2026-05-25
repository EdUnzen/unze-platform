"use client";

import { updateCommunityAction } from "@/app/community/actions";
import type { Community } from "@/types/community";
import { CommunityForm } from "./CommunityForm";
import { useActionState } from "react";

interface EditCommunityClientProps {
  community: Community;
}

export function EditCommunityClient({ community }: EditCommunityClientProps) {
  const boundUpdate = updateCommunityAction.bind(
    null,
    community.id,
    community.slug,
  );
  const [state, action, pending] = useActionState(boundUpdate, null);

  return (
    <CommunityForm
      mode="edit"
      initial={community}
      action={action}
      pending={pending}
      error={state?.error ?? null}
    />
  );
}
