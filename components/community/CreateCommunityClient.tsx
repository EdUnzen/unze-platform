"use client";

import { createCommunityAction } from "@/app/community/actions";
import { CommunityForm } from "./CommunityForm";
import { useActionState } from "react";

export function CreateCommunityClient() {
  const [state, action, pending] = useActionState(createCommunityAction, null);

  return (
    <CommunityForm
      mode="create"
      action={action}
      pending={pending}
      error={state?.error ?? null}
    />
  );
}
