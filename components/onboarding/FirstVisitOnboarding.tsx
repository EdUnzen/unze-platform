"use client";

import {
  UnzeOnboardingDialog,
} from "@/components/onboarding/UnzeOnboardingDialog";
import { ONBOARDING_STORAGE_KEY } from "@/lib/constants/onboarding-copy";
import { isMarketingModeActive } from "@/lib/marketing/marketing-mode";
import { useEffect, useState } from "react";

/** Erstbesuch: einmalig Willkommen + UNZE-Erklärung + Installation */
export function FirstVisitOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isMarketingModeActive()) return;
    if (localStorage.getItem(ONBOARDING_STORAGE_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!open) return null;

  return (
    <UnzeOnboardingDialog
      open={open}
      mode="full"
      markComplete
      onClose={() => setOpen(false)}
    />
  );
}
