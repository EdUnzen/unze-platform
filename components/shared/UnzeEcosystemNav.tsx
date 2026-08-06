"use client";

import { UNZE_BUSINESS_HREF, UNZE_COMMUNITY_HREF } from "@/lib/constants/unze-ecosystem-nav";
import { usePathname } from "next/navigation";

/**
 * Community ↔ Business — immer Full-Page-Load (<a>), damit die richtige Shell
 * (MarketingShell / BusinessShell) serverseitig geladen wird.
 */
export function UnzeEcosystemNav() {
  const pathname = usePathname() ?? "";
  const isBusiness =
    pathname === UNZE_BUSINESS_HREF || pathname.startsWith(`${UNZE_BUSINESS_HREF}/`);

  const tabClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
      active
        ? "bg-[#00C853] text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <nav
      className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50/90 p-0.5"
      aria-label="UNZE Bereich"
    >
      <a href={UNZE_COMMUNITY_HREF} className={tabClass(!isBusiness)}>
        Community
      </a>
      <a href={UNZE_BUSINESS_HREF} className={tabClass(isBusiness)}>
        Business
      </a>
    </nav>
  );
}
