"use client";

import { isStudioNavActive, STUDIO_NAV_ICONS } from "@/components/studio/studio-nav-utils";
import { STUDIO_PRIMARY_NAV_ITEMS } from "@/lib/studio/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function StudioPrimaryNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white">
      <ul className="mx-auto grid max-w-lg grid-cols-3">
        {STUDIO_PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = STUDIO_NAV_ICONS[item.icon];
          const active = isStudioNavActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 py-2 text-xs font-medium ${
                  active ? "text-emerald-700" : "text-gray-500"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
