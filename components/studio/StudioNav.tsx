"use client";

import { STUDIO_NAV_ITEMS } from "@/lib/studio/constants";
import { Camera, FileText, Inbox, LayoutGrid, Receipt, ShoppingBag, Tag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  overview: LayoutGrid,
  inbox: Inbox,
  users: Users,
  tag: Tag,
  file: FileText,
  receipt: Receipt,
  shop: ShoppingBag,
  camera: Camera,
} as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/studio/app/uebersicht") {
    return pathname === href || pathname.startsWith("/studio/app/uebersicht/");
  }
  if (href === "/studio/app") {
    return pathname === href || pathname.startsWith("/studio/app/inquiries");
  }
  if (href === "/studio/app/angebote") {
    return pathname.startsWith("/studio/app/angebote");
  }
  if (href === "/studio/app/auftraege") {
    return pathname.startsWith("/studio/app/auftraege");
  }
  if (href === "/studio/app/kunden") {
    return pathname.startsWith("/studio/app/kunden");
  }
  if (href === "/studio/app/marketing") {
    return pathname.startsWith("/studio/app/marketing");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudioSidebarNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="flex-1 space-y-1 p-3">
      {STUDIO_NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-emerald-50 text-emerald-800"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function StudioMobileNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white lg:hidden">
      <ul className="mx-auto flex max-w-lg">
        {STUDIO_NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isNavActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-2.5 text-[10px] font-medium ${
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
