"use client";

import {
  MARKETING_MODE_QUERY,
  isMarketingQuery,
} from "@/lib/constants/marketing-mode";
import { activateMarketingModeSession } from "@/lib/marketing/marketing-mode";
import { useEffect } from "react";

/**
 * Aktiviert Marketing-Modus per ?marketing=1 (Session).
 * Blendet Onboarding, Install-Hinweise und Hilfe-UI aus - nur fuer Captures.
 */
export function MarketingModeInit() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (isMarketingQuery(params.get(MARKETING_MODE_QUERY))) {
      activateMarketingModeSession();
      window.dispatchEvent(new Event("unze-marketing-mode"));
    } else if (sessionStorage.getItem("unze-marketing-mode") === "1") {
      document.documentElement.dataset.marketingMode = "true";
    }
  }, []);

  return null;
}
