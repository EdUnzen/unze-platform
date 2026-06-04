"use client";

import { createCommunityAction } from "@/app/community/actions";
import { ActionSuccessBanner } from "@/components/ui/ActionSuccessBanner";
import { CommunityForm } from "./CommunityForm";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

export function CreateCommunityClient() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createCommunityAction, null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.redirectTo) {
      setShowSuccess(true);
      const t = setTimeout(() => {
        router.push(state.redirectTo!);
        router.refresh();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [state?.redirectTo, router]);

  return (
    <div className="space-y-3">
      {showSuccess && (
        <ActionSuccessBanner message="Community erstellt — weiter zum Dashboard…" />
      )}
      <CommunityForm
        mode="create"
        action={action}
        pending={pending}
        error={state?.error ?? null}
      />
    </div>
  );
}
