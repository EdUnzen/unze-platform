"use client";

import { STUDIO_AREA_GROUPS } from "@/lib/studio/constants";
import { isStudioNavActive, STUDIO_NAV_ICONS } from "@/components/studio/studio-nav-utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type StudioAreaListProps = {
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
};

export function StudioAreaList({ pathname, onNavigate, compact = false }: StudioAreaListProps) {
  return (
    <div className={compact ? "space-y-6" : "space-y-8"}>
      {STUDIO_AREA_GROUPS.map((group) => (
        <section key={group.id}>
          <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {group.title}
          </h2>
          <ul className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {group.items.map((item) => {
              const Icon = STUDIO_NAV_ICONS[item.icon];
              const active = isStudioNavActive(pathname, item.href);
              return (
                <li key={item.href} className="border-b border-gray-100 last:border-b-0">
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex min-h-[4.25rem] items-center gap-3 px-4 py-3 ${
                      active ? "bg-emerald-50" : "active:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        active ? "bg-emerald-100 text-emerald-800" : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[15px] font-semibold ${active ? "text-emerald-900" : "text-gray-900"}`}>
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-gray-500">{item.description}</span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
