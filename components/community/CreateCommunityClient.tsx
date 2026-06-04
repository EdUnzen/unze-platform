"use client";

import { createCommunityAction } from "@/app/community/actions";
import { CommunityForm } from "./CommunityForm";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

export function CreateCommunityClient() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createCommunityAction, null);

  useEffect(() => {
    if (state?.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state?.redirectTo, router]);

  return (
    <CommunityForm
      mode="create"
      action={action}
      pending={pending}
      error={state?.error ?? null}
    />
  );
}
