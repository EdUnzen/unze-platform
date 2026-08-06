"use client";

import { isMarketingModeActive } from "@/lib/marketing/marketing-mode";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener("unze-marketing-mode", onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("unze-marketing-mode", onStoreChange);
  };
}

function getSnapshot() {
  return isMarketingModeActive();
}

function getServerSnapshot() {
  return false;
}

export function useMarketingMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
