import {
  MARKETING_MODE_QUERY,
  MARKETING_MODE_SESSION_KEY,
  isMarketingQuery,
} from "@/lib/constants/marketing-mode";

/** Client-side: Marketing-/Demo-Modus aktiv (Screenshots, keine Overlays). */
export function isMarketingModeActive(): boolean {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  if (isMarketingQuery(params.get(MARKETING_MODE_QUERY))) {
    return true;
  }

  return sessionStorage.getItem(MARKETING_MODE_SESSION_KEY) === "1";
}

export function activateMarketingModeSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(MARKETING_MODE_SESSION_KEY, "1");
  document.documentElement.dataset.marketingMode = "true";
}

export function deactivateMarketingModeSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(MARKETING_MODE_SESSION_KEY);
  delete document.documentElement.dataset.marketingMode;
}
