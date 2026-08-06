"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UNZE_ECOSYSTEM_AREAS,
  resolveUnzeEcosystemArea,
  type UnzeEcosystemArea,
} from "@/lib/constants/unze-ecosystem-nav";

type UnzeAreaSwitcherProps = {
  /** Explizit setzen, wenn der Pfad allein nicht reicht */
  active?: UnzeEcosystemArea;
  className?: string;
};

export function UnzeAreaSwitcher({ active, className = "" }: UnzeAreaSwitcherProps) {
  const pathname = usePathname() ?? "/";
  const current = active ?? resolveUnzeEcosystemArea(pathname);

  return (
    <div
      role="group"
      aria-label="UNZE Bereich wechseln"
      className={`inline-flex shrink-0 rounded-lg bg-gray-100 p-0.5 ring-1 ring-gray-200/80 ${className}`}
    >
      {( [UNZE_ECOSYSTEM_AREAS.community, UNZE_ECOSYSTEM_AREAS.business] as const).map(
        (area) => {
          const isActive = current === area.id;
          return (
            <Link
              key={area.id}
              href={area.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/80"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {area.label}
            </Link>
          );
        },
      )}
    </div>
  );
}
